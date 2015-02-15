'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var annotationParser = require('../lib/annotation-parser');
var readTestFileSync = require('./_helper').readTestFileSync;


describe('annotation-parser', function () {

  it('should normalize a single quoted string', function() {
    assert.deepEqual(annotationParser.normalizeProperty('\'demo\''), ['demo']);
  });

  it('should normalize a double quoted string', function() {
    assert.deepEqual(annotationParser.normalizeProperty('"demo"'), ['demo']);
  });

  it('should normalize multiple values', function() {
    assert.deepEqual(annotationParser.normalizeProperty('"demo1"', '\'demo2\''), ['demo1', 'demo2']);
  });

  it('should normalize arrays values', function() {
    assert.deepEqual(annotationParser.normalizeProperty(['demo1', 'demo2'], ['demo3'], 'demo4'), ['demo1', 'demo2', 'demo3', 'demo4']);
  });

  it('should normalize undefined values', function() {
    var input = {
      bar: 'demo1'
    };
    assert.deepEqual(annotationParser.normalizeProperty(input.foo, input.bar, input.baz), ['demo1']);
  });

  it('should parse test1.css', function () {
    var annotations = annotationParser.parse(readTestFileSync('fixtures/css/test1/test.css'), 'exclude');
    assert.deepEqual(annotations, [
      {
        'files': [
          'file1',
          'file2',
          'file3',
          'file4',
          'file5',
          'file6'
        ],
        'selectors': [
          '.demo'
        ]
      }
    ]);
  });

  it('should not find any annotations values in test2.css', function () {
    var annotations = annotationParser.parse(readTestFileSync('fixtures/css/test2/test.css'), 'exclude');
    assert.deepEqual(annotations, []);
  });

});