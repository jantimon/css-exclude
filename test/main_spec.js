/*global describe, it */
'use strict';

require('should');
var path = require('path');
var fs = require('fs');
var postcss = require('postcss');
var cssExclude = require('../');
var FileMatcher = require('../lib/FileMatcher.js');

var fixturePath = path.resolve(__dirname, 'fixtures');

describe('cssExclude', function () {

  /**
   * Turns all arguments into a concatenated parsed postcss object
   * @returns {*}
   */
  function testInput() {
    var files = [];
    for (var i = 0; i < arguments.length; i++) {
      files.push(postcss.parse(arguments[i], { from: 'example-' + i + '.css' }));
      if (i > 0) {
        files[0].append(files[i]);
      }
    }
    return files[0] ? files[0] : undefined;
  }

  /**
   * Returns the sass render result object for the test/fixtures/main.scc
   */
  function sassFixtures() {
    var nodeSass = require('node-sass');
    var filePath = path.join(fixturePath, 'scss');
    var mainFile = filePath + '/main.scss';
    var result = nodeSass.renderSync({
      file: mainFile,
      imagePath: '',
      includePaths: [ filePath ],
      omitSourceMapUrl: false,
      indentedSyntax: false,
      outputStyle: 'nested',
      precision: 5,
      sourceComments: false,
      sourceMapEmbed: true,
      sourceMapContents: false,
      sourceMap: mainFile + '.map'
    });
    return result;
  }

  it('should find all excluded files', function () {
    var input = testInput(
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".selector2" \n' +
      ' * @file demo.css \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".selector2" \n' +
      ' * @file "demo1.css", \'demo2.css\' \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".selector2" \n' +
      ' * @files "demo1.css", "demo3.css" \n */' +
      '.test1 { backround: red; }');
    var exclusions = cssExclude().getExclusions(input);
    var fileMatcher = new FileMatcher(exclusions);
    var files = fileMatcher.getFilenames(exclusions);
    JSON.stringify(files).should.be.equal('["demo.css","demo1.css","demo2.css","demo3.css"]');
  });

  it('should return the selectors if a rule is part of a excluded files', function () {
    var input = testInput(
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".panel1", ".panel2" \n' +
      ' * @file example-0.css \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel4", ".panel5" \n' +
      ' * @file "demo1.css", "demo2.css" \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel2", ".panel3" \n' +
      ' * @files "example-0.css", "demo3.css" \n */' +
      '.test1 { backround: red; }');
    var exclusions = cssExclude().getExclusions(input);
    var fileMatcher = new FileMatcher(exclusions);
    JSON.stringify(fileMatcher.getExclusionSelectorsForFile('example-0.css')).should.be.equal('[".panel1",".panel2",".panel3"]');
  });

  it('should return the selectors if a rule is part of a excluded file expression', function () {
    var input = testInput(
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".panel1" \n' +
      ' * @file example-*.css \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel4", ".panel5" \n' +
      ' * @file "demo1.css", "demo2.css" \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selectors ".panel2", ".panel3" \n' +
      ' * @files "example-*.css", "demo3.css" \n */' +
      '.test1 { backround: red; }');
    var exclusions = cssExclude().getExclusions(input);
    var fileMatcher = new FileMatcher(exclusions);
    JSON.stringify(fileMatcher.getExclusionSelectorsForFile('example-0.css')).should.be.equal('[".panel1",".panel2",".panel3"]');
  });

  it('should not touch css without exclusions', function () {
    var input = testInput(
        '.panel1 { backround: red; }' +
        '.panel1 { display: block; }' +
        '.panel3 { background: red }' +
        '.panel20 { background: green; }',
        '.test1 { backround: red; }');
    var expected = '.panel1 { backround: red; }' +
        '.panel1 { display: block; }' +
        '.panel3 { background: red }' +
        '.panel20 { background: green; }' +
        '.test1 { backround: red; }';
    expected.should.be.equal(cssExclude().transform(input).css);
  });

  it('should not touch css if no selectors are specified', function () {
    var input = [
      '/* @exclude */',
      '.panel1 { backround: red; }',
      '.panel1 { display: block; }',
      '.panel3 { background: red }',
      '.panel20 { background: green; }',
      '.test1 { backround: red; }'
    ].join('\n');
    var expected = [
      '/* @exclude */',
      '.panel1 { backround: red; }',
      '.panel1 { display: block; }',
      '.panel3 { background: red }',
      '.panel20 { background: green; }',
      '.test1 { backround: red; }'
    ].join('\n');
    expected.should.be.equal(cssExclude().transform(input).css);
  });

  it('should trace back files with source maps', function () {
    var sassResult = sassFixtures();
    var root = postcss.parse(sassResult.css, {map: {prev: sassResult.sourceMap}});
    var exclusions = cssExclude().getExclusions(root);
    var fileMatcher = new FileMatcher(exclusions);
    // The first css rule was imported from test1.scss
    fileMatcher.getRuleFilename(root.nodes[0]).should.be.equal('test1.scss');
  });

  it('should trace back files with source maps and find the according selectors', function () {
    var sassResult = sassFixtures();
    var root = postcss.parse(sassResult.css, {map: {prev: sassResult.sourceMap}});
    var exclusions = cssExclude().getExclusions(root);
    var fileMatcher = new FileMatcher(exclusions);
    fileMatcher.getExclusionSelectorsForFile('test1.scss');
    JSON.stringify(fileMatcher.getExclusionSelectorsForFile('test1.scss')).should.be.equal('["*.nasty *"]');
  });

  it('should trace back files with source maps and return false if there are no selectors', function () {
    var sassResult = sassFixtures();
    var root = postcss.parse(sassResult.css, {map: {prev: sassResult.sourceMap}});
    var exclusions = cssExclude().getExclusions(root);
    var fileMatcher = new FileMatcher(exclusions);
    JSON.stringify(fileMatcher.getExclusionSelectorsForFile('test2.scss')).should.be.equal('false');
  });

  it('should allow to pass a cwd', function () {
    var root = postcss.parse('body { background: blue }', { from: '/demo/example.css' });
    var exclusions = cssExclude().getExclusions(root);
    var fileMatcher = new FileMatcher(exclusions, '/demo/');
    fileMatcher.getRuleFilename(root.nodes[0]).should.be.equal('example.css');
  });

  it('should remove the excluded selector', function () {
    var input = testInput(
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".panel1" \n' +
      ' * @file example-*.css \n */' +
      '.panel1 { backround: red; }' +
      '.panel3 { background: red }' +
      '.panel20 { background: green; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel4", ".panel5" \n' +
      ' * @file "demo1.css", "demo2.css" \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel2", \'.panel3\' \n' +
      ' * @files "example-*.css", "demo3.css" \n */' +
      '.test1 { backround: red; }');

    var expected = '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".panel1" \n' +
      ' * @file example-*.css \n' +
      ' */.panel20 { background: green; }/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel4", ".panel5" \n' +
      ' * @file "demo1.css", "demo2.css" \n' +
      ' */.test1 { backround: red; }/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel2", \'.panel3\' \n' +
      ' * @files "example-*.css", "demo3.css" \n' +
      ' */.test1 { backround: red; }';

    expected.should.be.equal(cssExclude().transform(input).css);

  });

  it('should remove the excluded selector as postcss processor', function () {

    var input = testInput(
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".panel1" \n' +
      ' * @file example-*.css \n */' +
      '.panel1 { backround: red; }' +
      '.panel3 { background: red }' +
      '.panel20 { background: green; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel4", ".panel5" \n' +
      ' * @file "demo1.css", "demo2.css" \n */' +
      '.test1 { backround: red; }',
      '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel2", \'.panel3\' \n' +
      ' * @files "example-*.css", "demo3.css" \n */' +
      '.test1 { backround: red; }');
    var expected = '/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel1", ".panel1" \n' +
      ' * @file example-*.css \n' +
      ' */.panel20 { background: green; }/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel4", ".panel5" \n' +
      ' * @file "demo1.css", "demo2.css" \n' +
      ' */.test1 { backround: red; }/* \n' +
      ' * @exclude\n' +
      ' * @selector ".panel2", \'.panel3\' \n' +
      ' * @files "example-*.css", "demo3.css" \n' +
      ' */.test1 { backround: red; }';

    expected.should.be.equal(postcss().use(cssExclude.postcss).process(input).css);

  });

  it('should work with node sass source map', function () {
    var filePath = path.join(fixturePath, 'scss');
    var result = sassFixtures();
    var css = cssExclude({}).transform(result.css).css;
    css = css.replace(/\/\*# sourceMappingURL\=.+/, '');
    var expected = fs.readFileSync(filePath + '/expected.css', 'utf8');
    css.should.be.equal(expected);
  });

  it('should work with less source map', function (done) {
    var less = require('less/lib/less-node');
    var filePath = path.join(fixturePath, 'less');
    var mainFile = filePath + '/main.less';
    var mainSource = fs.readFileSync(mainFile, 'utf8');
    var expected = fs.readFileSync(filePath + '/expected.css', 'utf8');
    less.render(mainSource, {
        paths: [ filePath ],
        sourceMap: {
          sourceMapBasepath: filePath,
          sourceMapRootpath: 'test/fixtures/less',
          sourceMapFileInline: true
        }
      }).then(function (result) {
        setTimeout(function () {
          var css = cssExclude({cwd: 'test/fixtures/less'}).transform(result.css).css;
          css = css.replace(/\/\*# sourceMappingURL\=.+/, '');
          css.should.be.equal(expected);
          done();
        });
      });

  });

});

