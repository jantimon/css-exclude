'use strict';
var postcss = require('postcss');
var cssAnnotationParser = require('css-annotation');
var FileMatcher = require('./fileMatcher');
var minimatch = require('minimatch');

var DEFAULTS = {
  cwd: process.cwd()
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
 *
 * @param css
 */
CssExclude.prototype.getAnnotations = function (css) {
  return cssAnnotationParser.parse(css)
    .filter(function (annotation) {
      return annotation.exclude;
    });
};

/**
 * Extracts annotations and normalizes them
 */
CssExclude.prototype.getExclusions = function (css) {
  return this.getAnnotations(css)
    .map(function (annotation) {
      var files = annotation.file || annotation.files;
      files = (Array.isArray(files) ? files : [files]).map(function (filename) {
        return filename ? filename.replace(/^\s*('|")/, '').replace(/('|")\s*$/, '') : filename;
      });
      var selectors = annotation.selector || annotation.selectors;
      selectors = (Array.isArray(selectors) ? selectors : [selectors]).map(function (selector) {
        return selector ? selector.replace(/^\s*('|")/, '').replace(/('|")\s*$/, '') : selector;
      });
      return {
        files: files,
        selectors: selectors
      };
    });
};

/**
 * Helper which sets the rule selectors.
 * @param rule
 * @param selectors
 */
CssExclude._setRuleSelector = function(rule, selectors) {
  if (selectors.length > 0) {
    rule.selector = selectors.join(', ').trim();
  } else {
    rule.removeSelf();
  }
};

/**
 * The main processing function
 * @param css
 */
CssExclude.prototype.postcss = function (css) {
  var exclusions = this.getExclusions(css);
  // Skip if there aren't any exclusion annotations
  if (exclusions.length === 0) {
    return css;
  }

  // Get all excluded files
  var fileMatcher = new FileMatcher(exclusions, this.options.cwd);
  css.eachRule(function (rule) {
    var ruleFileName = fileMatcher.getRuleFilename(rule);
    var annotatedSelectors = fileMatcher.getExclusionSelectorsForFile(ruleFileName);
    for (var i = 0; i < annotatedSelectors.length; i++) {
      var selectors = rule.selectors;
      var filtered = [];
      for (var j = 0, len = selectors.length; j < len; j++) {
        if (minimatch(selectors[j], annotatedSelectors[i], {dot: true}) === false) {
          filtered.push(selectors[j]);
        }
      }
      CssExclude._setRuleSelector(rule, filtered);
      if(filtered.length === 0) {
        break;
      }
    }
  });

  return css;
};

CssExclude.prototype.transform = function (css, opts) {
  return postcss().use(this.postcss).process(css, opts);
};


module.exports = CssExclude;
