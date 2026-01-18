import { dispatchMessage } from './helpers/message.js'
import { getSelection } from './helpers/selection.js'
import { toggleLinkInspectMode } from './helpers/utils.js'

function selectionHandler(evt) {
  toggleLinkInspectMode(false)

  const text = getSelection()

  if (text) {
    chrome.runtime.sendMessage({ type: 'selection', text: text })
  }
}

document.addEventListener('mouseup', selectionHandler)
