'use strict';
var minimatch = require('minimatch');

function FileMatcher(exclusions, cwd) {
  var self = this;
  self.cache = {};
  self.filenameMap = {};
  this.cwd = (cwd || process.cwd()).replace(/[\\\/]$/, '');
  exclusions.forEach(function (exclusion) {
    exclusion.files.forEach(function (filename) {
      // Add selectors
      self.filenameMap[filename] = self.filenameMap[filename] || [];
      self.filenameMap[filename] = self.filenameMap[filename].concat(exclusion.selectors);
    });
  });
}

/**
 * Get all filenames
 */
FileMatcher.prototype.getFilenames = function () {
  return Object.keys(this.filenameMap);
};

/**
 * Extracts the filename of the rule and follows the source map if available
 *
 * @param rule
 * @returns {*}
 */
FileMatcher.prototype.getRuleFilename = function(rule) {
  var filePath = rule.source.input.file;
  if(rule.source.input.map) {
    var consumer = rule.source.input.map.consumerCache;
    var originalPosition = consumer.originalPositionFor(rule.source.start);
    /* istanbul ignore else */
    if(originalPosition.source) {
      filePath = originalPosition.source;
    }
  }
  // turn into relative file path
  return typeof filePath ==='string' && filePath.indexOf(this.cwd) === 0 ? filePath.substr(this.cwd.length + 1) : filePath;
};


FileMatcher.prototype.getExclusionSelectorsForFile = function (filename) {
  var self = this;
  /* istanbul ignore if */
  if (filename === undefined) {
    return false;
  }
  if (this.cache[filename] === undefined) {
    // Search through all pattern
    var matchingExpressions = this.getFilenames()
      .filter(function (fileExpression) {
        return minimatch(filename, fileExpression);
      });
    // Concat all matching selectors
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

module.exports = FileMatcher;