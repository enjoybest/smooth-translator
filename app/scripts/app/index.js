import _ from 'lodash'
import migrateOptions from './migrate-options.js'

const defaults = {
  notifyTimeout: 5,
  siteRules: {
    '*': true
  },
}

let options = _.clone(defaults);

function isSiteEnabled(site) {
  const { siteRules } = options;
  if (site in siteRules) {
    return siteRules[site]
  } else {
    return siteRules['*']
  }
}

function setOptions(newOptions) {
  chrome.storage.local.set(newOptions)
  options = newOptions
}

function getOptions() {
  if (_.isEmpty(options)) {
    return Promise.resolve(options)
  } else {
    return chrome.storage.local.get(null)
  }
}

function prepareOptions() {
  chrome.storage.local.get(null)
    .then(storedOptions => migrateOptions(storedOptions))
    .then(migratedOptions => _.defaults(migratedOptions, defaults))
    .then(finalOptions => setOptions(finalOptions))
  chrome.storage.onChanged.addListener(() => {
    chrome.storage.local.get(null)
      .then(storedOptions => migrateOptions(storedOptions))
      .then(migratedOptions => _.defaults(migratedOptions, defaults))
      .then(finalOptions => options = finalOptions)
  })
}

export default {
  isSiteEnabled,
  prepareOptions,
}
