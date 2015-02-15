'use strict';
var minimatch = require('minimatch');

function SelectorDictionary(css) {
  var self = this;
  self.cache = {};
  self.filenameMap = {};
  var exclusions = require('./annotation-parser').parse(css, 'exclude');
  exclusions.forEach(function (exclusion) {
    exclusion.files.forEach(function (filename) {
      // Add selectors
      self.filenameMap[filename] = self.filenameMap[filename] || [];
      self.filenameMap[filename] = self.filenameMap[filename].concat(exclusion.selectors);
    });
  });
  self.filenames = Object.keys(self.filenameMap);
}

SelectorDictionary.prototype.getSelectorsForFile = function (filename) {
  var self = this;
  if (filename === undefined) {
    return false;
  }
  if (this.cache[filename] === undefined) {
    // Search through all pattern
    var matchingExpressions = self.filenames
      .filter(function (fileExpression) {
        return minimatch(filename, fileExpression);
      });
    // Concatenate all matching selectors
    var selectors = {};
    matchingExpressions.forEach(function (fileExpression) {
      self.filenameMap[fileExpression].forEach(function (selector) {
        selectors[selector] = true;
      });
    });
    selectors = Object.keys(selectors);
    this.cache[filename] = selectors.length ? selectors : false;
  }
  return this.cache[filename];
};

module.exports = SelectorDictionary;