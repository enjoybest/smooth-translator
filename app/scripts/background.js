import { dispatchMessage } from './helpers/message.js'
import { getActiveTab } from './helpers/tabs.js'
import defaults from './config/defaults.js'
import { trim } from 'lodash'
import app from './app/index.js'

const PAT_WORD = /^[a-z]+('|'s)?$/i

// Offscreen document management
let creatingOffscreen = null

async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    console.log('Offscreen document already exists')
    return
  }

  if (creatingOffscreen) {
    console.log('Waiting for offscreen document creation')
    await creatingOffscreen
    return
  }

  console.log('Creating offscreen document')
  creatingOffscreen = chrome.offscreen.createDocument({
    url: 'pages/offscreen.html',
    reasons: ['DOM_SCRAPING'],
    justification: 'Translation requires iframe-based web scraping'
  })

  await creatingOffscreen
  creatingOffscreen = null
  console.log('Offscreen document created')
}

// Cache translation results using chrome.storage.local
async function getCachedTranslation(key) {
  const result = await chrome.storage.local.get(key)
  return result[key]
}

async function setCachedTranslation(key, value, ttlMinutes = 60) {
  const expiryTime = Date.now() + (ttlMinutes * 60 * 1000)
  await chrome.storage.local.set({
    [key]: value,
    [`${key}_expiry`]: expiryTime
  })
}

async function translateText (text) {
  const sourceText = trim(text)
  const cacheKey = `text:v2:${sourceText}`

  console.log('translateText called with:', sourceText)

  try {
    // Check cache
    const cached = await getCachedTranslation(cacheKey)
    const expiryKey = `${cacheKey}_expiry`
    const expiryResult = await chrome.storage.local.get(expiryKey)

    if (cached && expiryResult[expiryKey] && Date.now() < expiryResult[expiryKey]) {
      console.log('Returning cached translation')
      return cached
    }

    // Ensure offscreen document exists
    await ensureOffscreenDocument()

    console.log('Sending message to offscreen document')
    // Translate using offscreen document
    const result = await chrome.runtime.sendMessage({
      type: 'translate-offscreen',
      text: sourceText
    })

    console.log('Received result from offscreen:', result)

    if (result) {
      await setCachedTranslation(cacheKey, result)
      return result
    } else {
      return {
        translation: '未找到释义',
        status: 'failure'
      }
    }
  } catch (error) {
    console.error('Error in translateText:', error)
    return {
      translation: '未找到释义',
      status: 'failure'
    }
  }
}

function isWord(text) {
  return PAT_WORD.test(text)
}

dispatchMessage({
  translate (message, sender, sendResponse) {
    chrome.storage.local.get('notifyTimeout').then(result => {
      const notifyTimeout = result.notifyTimeout || defaults.notifyTimeout
      return translateText(message.text).then(translationResult => {
        if (!translationResult) {
          translationResult = {
            translation: '未找到释义',
            status: 'failure'
          }
        }
        if (message.from === 'page') {
          translationResult.timeout = notifyTimeout
          sendResponse(translationResult)
        } else {
          chrome.storage.local.set({ current: message.text }).then(() => {
            sendResponse(translationResult)
          })
        }
      })
    }).catch(error => {
      console.error('Translation error in background:', error)
      sendResponse({
        translation: '未找到释义',
        status: 'failure'
      })
    })
    return true // Keep message channel open for async response
  },

  selection (message, sender, sendResponse) {
    chrome.storage.local.set({ current: message.text })

    if (isWord(message.text)) {
      getActiveTab(tab => {
        if (app.isSiteEnabled(tab.hostname)) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'translate',
            text: message.text
          })
        }
      })
    }
  },

  current (message, sender, sendResponse) {
    chrome.storage.local.get('current').then(result => {
      sendResponse(result.current)
    })
    return true // Keep message channel open for async response
  },

  linkInspect (message, sender, sendResponse) {
    if (message.enabled) {
      chrome.action.setIcon({ path: chrome.runtime.getURL('images/icon-128-link.png') })
    } else {
      chrome.action.setIcon({ path: chrome.runtime.getURL('images/icon-128.png') })
    }
  }
})

// Register command for quick link inspect switch
chrome.commands.onCommand.addListener(command => {
  if (command === 'toggle-link-inspect') {
    getActiveTab(tab => chrome.tabs.sendMessage(tab.id, { type: 'toggleLink' }))
  }
})

app.prepareOptions()
