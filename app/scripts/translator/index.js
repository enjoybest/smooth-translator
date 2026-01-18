import _ from 'lodash'
import Dict from './dict.js'
import Fanyi from './fanyi.js'
import { words } from 'lodash'

const PAT_WORD = /^([a-z]+-?)+$/i
const RESULT_FAILURE = {
  translation: '未找到释义',
  status: 'failure'
}

function isWord (text) {
  return text.match(PAT_WORD)
}

function smartText (text) {
  return isWord(text) ? words(text).join(' ') : text
}

function translate (text) {
  const sourceText = smartText(text)

  if (!sourceText) {
    return Promise.resolve(RESULT_FAILURE)
  } else if (isWord(sourceText)) {
    return Dict.translate(sourceText)
               .catch(() => RESULT_FAILURE)
  } else {
    return Fanyi.translate(sourceText).catch(() => RESULT_FAILURE)
  }
}

export default { translate }
