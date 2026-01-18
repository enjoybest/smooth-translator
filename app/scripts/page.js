import { createApp } from 'vue'
import { dispatchMessage } from './helpers/message.js'
import { toggleLinkInspectMode } from './helpers/utils.js'
import ResultList from './components/ResultList.vue'

let appInstance = null;

function getApp () {
  if (!document.getElementById('cst-list')) {
    const div = document.createElement('div')
    div.id = 'cst-list'
    document.body.appendChild(div)
    appInstance = createApp(ResultList).mount('#cst-list');
  }

  return appInstance
}

function translate (message, sender, sendResponse) {
  getApp().translate(message.text)
}

function toggleLink (message, sender, sendResponse) {
  toggleLinkInspectMode()
}

dispatchMessage({ translate, toggleLink })
