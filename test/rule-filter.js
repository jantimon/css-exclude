'use strict';
var postcss = require('postcss');
var assert = require('assert');
var RuleFilter = require('../lib/rule-filter');
var lessFixtures = require('./_helper').lessFixtures;
var sassFixtures = require('./_helper').sassFixtures;

describe('rule-filter', function () {

  it('should find the selector inside scss/test1.scss', function () {
    var css = sassFixtures();
    var root = postcss.parse(css);
    var filter = new RuleFilter(css);
    assert.deepEqual(filter.matches(root.nodes[3]), ['a .really > .nasty #selector .example']);
  });

  it('should not find an invalid selector inside scss/test1.scss', function () {
    var css = sassFixtures();
    var root = postcss.parse(css);
    var filter = new RuleFilter(css);
    assert.deepEqual(filter.matches(root.nodes[1]), []);
  });

  it('should find the selector inside less/test1.less', function (done) {
    lessFixtures(function (css) {
      var root = postcss.parse(css);
      var filter = new RuleFilter(css);
      assert.deepEqual(filter.matches(root.nodes[3]), ['a .really > .nasty #selector .example']);
      done();
    });
  });

  it('should not find an invalid selector inside less/test1.less', function (done) {
    lessFixtures(function (css) {
      var root = postcss.parse(css);
      var filter = new RuleFilter(css);
      assert.deepEqual(filter.matches(root.nodes[1]), []);
      done();
    });
  });


});