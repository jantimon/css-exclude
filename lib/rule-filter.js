'use strict';
var postCssHelper = require('./post-css-helper');
var SelectorDictonary = require('./selector-dictionary');
var minimatch = require('minimatch');

function RuleFilter(css, cwd) {
  this.cwd = (cwd || process.cwd()).replace(/[\\\/]$/, '');
  this.dictonary = new SelectorDictonary(css);
}

RuleFilter.prototype.matches = function (rule) {
  var filename = postCssHelper.getFileName(rule, this.cwd);
  var annotatedSelectors = this.dictonary.getSelectorsForFile(filename);
  var matchedSelectors = rule.selectors.filter(function (ruleSelector) {
    for (var i = 0; i < annotatedSelectors.length; i++) {
      if (minimatch(ruleSelector, annotatedSelectors[i], {dot: true})) {
        return true;
      }
    }
    return false;
  });

  return matchedSelectors;
};


module.exports = RuleFilter;