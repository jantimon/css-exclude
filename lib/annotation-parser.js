'use strict';
/*
 * The AnnotationParser turns a css string into an array structure
 */
var AnnotationParser = {};
module.exports = AnnotationParser;

/**
 * Helper function to normalize annotation values into an array of strings
 *
 * @returns {Array}
 */
AnnotationParser.normalizeProperty = function(/* propertyValue1, propertyValue2, ... */) {
  // Turn all arguments in one array
  var valueList = [];
  for(var i = 0; i < arguments.length; i++) {
    if(arguments[i] !== undefined) {
      valueList = valueList.concat(arguments[i]);
    }
  }
  // Normalize values
  return valueList.filter(function(value) {
    return typeof value === 'string';
  }).map(function(value) {
    return value
      // Remove leading spaces, quotes and single quotes
      .replace(/^\s*('|")/, '')
      // Remove trailing spaces, quotes and single quotes
      .replace(/('|")\s*$/, '')
      // Glob optimization - turn *? into *
      .replace(/\*\?/g, '*');
  });
};

/**
 * Parses the css for a keyword and extracts the files and selectors
 *
 * ```
 *  @keyword
 *  @file demo1
 *  @files 'demo2', 'demo3'
 *  @selector 'example'
 * ```
 * is turned into
 * [{ files: ['demo1', 'demo2', 'demo3'], selectors: ['example'] }]
 *
 *
 * @param keyword
 * @param css
 */
AnnotationParser.parse = function (css, keyword) {
  return require('css-annotation').parse(css)
    .filter(function (annotation) {
      return annotation[keyword];
    })
    .map(function (annotation) {
      return {
        files: AnnotationParser.normalizeProperty(annotation.file, annotation.files),
        selectors: AnnotationParser.normalizeProperty(annotation.selector, annotation.selectors)
      };
    });
};


