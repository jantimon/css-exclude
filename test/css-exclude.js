'use strict';
var path = require('path');
var assert = require('assert');
var cssExclude = require('../lib/css-exclude');
var lessFixtures = require('./_helper').lessFixtures;
var sassFixtures = require('./_helper').sassFixtures;
var readTestFileSync = require('./_helper').readTestFileSync;
var parseTestFileSync = require('./_helper').parseTestFileSync;
var postcss = require('postcss');

describe('css-exclude', function () {

  it('should excludes styles from sass input', function () {
    var css = sassFixtures();
    var result = cssExclude().transform(css);
    assert.equal(result.css, readTestFileSync('fixtures/scss/expected.css'));
  });

  it('should excludes styles from less input', function (done) {
    lessFixtures(function (css) {
      var result = cssExclude({placeComments: true}).transform(css);
      assert.equal(result.css, readTestFileSync('fixtures/less/expected.css'));
      done();
    });
  });

  it('should excludes styles from css input', function() {
    var testFile = parseTestFileSync('fixtures/css/test3/test-1.css');
    testFile.append(parseTestFileSync('fixtures/css/test3/test-2.css'));
    var cwd = path.resolve(__dirname, 'fixtures/css/test3');
    var result = postcss().use(cssExclude({ cwd: cwd}).postcss).process(testFile);
    assert.equal(result.css, readTestFileSync('fixtures/css/test3/expected.css'));
  });

  it('should excludes styles from css input without placing debug comments', function() {
    var testFile = parseTestFileSync('fixtures/css/test4/test-1.css');
    testFile.append(parseTestFileSync('fixtures/css/test4/test-2.css'));
    var cwd = path.resolve(__dirname, 'fixtures/css/test4');
    var processor = cssExclude({ cwd: cwd, placeComments: false});
    var result = postcss().use(processor).process(testFile);
    assert.equal(result.css, readTestFileSync('fixtures/css/test4/expected.css'));
  });

  it('should excludes styles from sass input using the default configuration', function() {
    assert.equal(postcss().use(cssExclude.postcss).process(sassFixtures()), readTestFileSync('fixtures/scss/expected.css'));
  });

  it('should log the match count for matching files', function () {
    var css = sassFixtures();
    var origInfo = console.log;
    var logs = [];
    console.log = function () {
      logs.push(Array.prototype.join.call(arguments, ' - '));
    };
    cssExclude({debug: true}).transform(css);
    console.log = origInfo;
    assert.deepEqual(logs, ['test1.scss - 3 - matches', 'test2.scss - 0 - matches']);
  });

  it('should log the match count for all files', function () {
    var css = sassFixtures();
    var origInfo = console.log;
    var logs = [];
    console.log = function () {
      logs.push(Array.prototype.join.call(arguments, ' - '));
    };
    cssExclude({verbose: true}).transform(css);
    console.log = origInfo;
    assert.deepEqual(logs, ['test1.scss - 3 - matches']);
  });

});