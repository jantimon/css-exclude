'use strict';
var path = require('path');
var fs = require('fs');

/**
 * Returns the sass render result object for the test/fixtures/main.scc
 */
function sassFixtures() {
  var nodeSass = require('node-sass');
  var filePath = path.join(__dirname, 'fixtures', 'scss');
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
  return result.css;
}

function lessFixtures(callback) {
  var less = require('less/lib/less-node');
  var filePath = path.join(__dirname, 'fixtures', 'less');
  var mainFile = filePath + '/main.less';
  var mainSource = fs.readFileSync(mainFile, 'utf8');
  return less.render(mainSource, {
    paths: [ filePath ],
    sourceMap: {
      sourceMapBasepath: filePath,
      sourceMapRootpath: '',
      sourceMapFileInline: true
    }
  }).then(function (result) {
    setTimeout(function () {
      callback(result.css);
    });
  });
}

function readTestFileSync(filename) {
  return fs.readFileSync(path.join(__dirname, filename), 'utf-8');
}

function parseTestFileSync(filename) {
  var postcss = require('postcss');
  return postcss.parse(fs.readFileSync(path.join(__dirname, filename), 'utf-8'), {
    from: path.resolve(path.join(__dirname, filename))
  });
}

module.exports = {
  lessFixtures: lessFixtures,
  sassFixtures: sassFixtures,
  parseTestFileSync: parseTestFileSync,
  readTestFileSync: readTestFileSync
};