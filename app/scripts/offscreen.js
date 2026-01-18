import translator from './translator/index.js'

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message)

  if (message.type === 'translate-offscreen') {
    console.log('Starting translation for:', message.text)
    translator.translate(message.text)
      .then(result => {
        console.log('Translation successful:', result)
        sendResponse(result)
      })
      .catch(error => {
        console.error('Translation error:', error)
        sendResponse({
          translation: '未找到释义',
          status: 'failure'
        })
      })
    return true // Keep message channel open for async response
  }

  console.log('Message type not handled:', message.type)
})

console.log('Offscreen document loaded')
