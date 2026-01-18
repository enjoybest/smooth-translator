import _ from 'lodash';
import defaults from '../config/defaults.js';

export default {
  data() {
    return {
      options: Object.assign({}, defaults),
    };
  },
  methods: {
    initOptions() {
      chrome.storage.onChanged.addListener(() => this.loadOptions());
      return this.loadOptions();
    },
    loadOptions() {
      return chrome.storage.local.get(null).then(options => {
        this.options = Object.assign({}, defaults, options);
      });
    },
    updateOption(name, value) {
      this.options[name] = value;
      chrome.storage.local.set({ [name]: value });
    },
    saveRule(rule) {
      this.options.siteRules[rule.site] = rule.enabled
      this.updateOption('siteRules', this.options.siteRules);
    },
    removeRule(rule) {
      _.remove(this.options.siteRules, { site: rule.site });
      this.updateOption('siteRules', this.options.siteRules);
    }
  },
};
