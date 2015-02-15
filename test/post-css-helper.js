'use strict';
var assert = require('assert');
var path = require('path');
var postcss = require('postcss');
var postCssHelper = require('../lib/post-css-helper');
var parseTestFileSync = require('./_helper').parseTestFileSync;


describe('post-css-helper', function () {

  describe('getFileName', function() {
    it('should return undefined if no source map is present', function () {
      var root = postcss.parse('body { background: blue }');
      assert.equal(postCssHelper.getFileName(root.nodes[0]), undefined);
    });

    it('should return the correct filename from a css file', function () {
      var root = parseTestFileSync('fixtures/css/test1/test.css');
      var cwd = path.join(__dirname, 'fixtures');
      assert.equal(postCssHelper.getFileName(root.nodes[0], cwd), 'css/test1/test.css');
    });
  });


  describe('setRuleSelector', function () {
    it('should overwrite a rules selectors', function () {
      var root = parseTestFileSync('fixtures/css/test1/test.css');
      var firstNode = root.nodes[0];
      postCssHelper.setRuleSelector(firstNode, ['.demo1', '.demo2']);
      assert.deepEqual(firstNode.selector, '.demo1, .demo2');
    });

    it('should remove a rules if no selectors are left', function () {
      var root = parseTestFileSync('fixtures/css/test1/test.css');
      var firstNode = root.nodes[0];
      postCssHelper.setRuleSelector(firstNode, []);
      assert.notEqual(firstNode, root.nodes[0]);
    });
  });


});