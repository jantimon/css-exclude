'use strict';

var PostCssHelper = {};
module.exports = PostCssHelper;

/**
 * Extracts the filename of the rule from the source map if available
 *
 * @param rule
 * @returns {*}
 */
PostCssHelper.getFileName = function(rule, cwd) {
  var filePath = rule.source.input.file;
  if (rule.source.input.map) {
    var consumer = rule.source.input.map.consumerCache;
    var originalPosition = consumer.originalPositionFor(rule.source.start);
    filePath = originalPosition.source;
  }
  // turn into relative file path
  return typeof filePath === 'string' && filePath.indexOf(cwd) === 0 ? filePath.substr(cwd.length + 1) : filePath;
};


/**
 * Sets the selectors of a post css rule
 *
 * @param rule
 * @param selectors
 */
PostCssHelper.setRuleSelector = function (rule, selectors) {
  if (selectors.length > 0) {
    rule.selector = selectors.join(', ').trim();
  } else {
    rule.removeSelf();
  }
};