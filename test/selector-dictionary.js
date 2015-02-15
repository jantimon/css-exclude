'use strict';
var path = require('path');
var assert = require('assert');
var SelectorDictionary = require('../lib/selector-dictionary');
var lessFixtures = require('./_helper').lessFixtures;
var sassFixtures = require('./_helper').sassFixtures;

describe('selector-dictionary', function () {

  it('should return false when passing an undefined file', function() {
    var dictionary = new SelectorDictionary('body {background: blue}');
    assert.deepEqual(dictionary.getSelectorsForFile(), false);
  });

  it('should return false when asking for a none existing file', function() {
    var dictionary = new SelectorDictionary('body {background: blue}');
    assert.deepEqual(dictionary.getSelectorsForFile('an-unkown-file.scss'), false);
    assert.deepEqual(dictionary.getSelectorsForFile('an-unkown-file.scss'), false);
  });

  it('should find the selector inside scss/test1.scss', function () {
    var dictionary = new SelectorDictionary(sassFixtures());
    assert.deepEqual(dictionary.getSelectorsForFile('test1.scss'), ['*.nasty *']);
  });

  it('should find the selector inside less/test1.less', function (done) {
    lessFixtures(function(css){
      var dictionary = new SelectorDictionary(css, __dirname);
      assert.deepEqual(dictionary.getSelectorsForFile('test1.less'), ['*.nasty *']);
      done();
    });
  });

  it('should find the selector inside scss/test1.scss when using cache', function () {
    var dictionary = new SelectorDictionary(sassFixtures());
    assert.deepEqual(dictionary.getSelectorsForFile('test1.scss'), ['*.nasty *']);
    assert.deepEqual(dictionary.getSelectorsForFile('test1.scss'), ['*.nasty *']);
  });

});