'use strict';
var postcss = require('postcss');
var RuleFilter = require('./rule-filter');
var PostCssHelper = require('./post-css-helper');

var DEFAULTS = {
  cwd: process.cwd(),
  verbose: false,
  debug: false
};

function CssExclude(opts) {
  if (this instanceof CssExclude === false) {
    return new CssExclude(opts);
  }

  if (!opts) {
    this.options = DEFAULTS;
  } else {
    this.options = {};
    for (var key in DEFAULTS) {
      this.options[key] = opts[key] || DEFAULTS[key];
    }
  }

  this.postcss = CssExclude.prototype.postcss.bind(this);
}

/**
 * Public post css
 *
 * Usage: `postcss().use(CssExclude.postcss).process(css)`
 */
CssExclude.postcss = function () {
  return new CssExclude().postcss.apply(this, arguments);
};

/**
 * The main processing function
 * @param css
 */
CssExclude.prototype.postcss = function (css) {
  var options = this.options;
  var ruleFilter = new RuleFilter(css, options.cwd);
  var fileMatches = {};
  css.eachRule(function (rule) {
    var matches = ruleFilter.matches(rule);
    // Remove excluded selectors
    if (matches.length) {
      PostCssHelper.setRuleSelector(rule, rule.selectors.filter(function (ruleSelector) {
        return matches.indexOf(ruleSelector) === -1;
      }));
    }
    // Gather information for logging
    if (options.debug || options.verbose) {
      var filename = PostCssHelper.getFileName(rule, options.cwd);
      fileMatches[filename] = (fileMatches[filename] || 0) + matches.length;
    }
  });

  // Log match counts
  Object.keys(fileMatches).forEach(function(filename) {
    if (options.debug || options.verbose && fileMatches[filename]) {
      console.log(filename, fileMatches[filename], 'matches');
    }
  });

  return css;
};

CssExclude.prototype.transform = function (css, opts) {
  return postcss().use(this.postcss).process(css, opts);
};

module.exports = CssExclude;
