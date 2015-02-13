# css-exclude

[![Build Status](https://travis-ci.org/jantimon/css-exclude.svg)](https://travis-ci.org/jantimon/css-exclude)
[![NPM version](https://badge.fury.io/js/css-exclude.svg)](http://badge.fury.io/js/css-exclude)
[![Coverage Status](https://coveralls.io/repos/jantimon/css-exclude/badge.png)](https://coveralls.io/r/jantimon/css-exclude)
[![Dependency Status](https://david-dm.org/jantimon/css-exclude.png)](https://david-dm.org/jantimon/css-exclude)

## Motivation

Overwriting long selectors is a real pain and causes code which is hard to maintain.
*css-exclude* allows you to overwrite selectors with high specificity.

## How does it work?

*css-exclude* is a [postcss](https://github.com/postcss/postcss) processor similar to autoprefixer.  
So this library works with any preprocess whith inline source map support.  
Right now there are [tests for **sass** and **less**](https://github.com/jantimon/css-exclude/tree/master/test)


## Example

vendor.less
```css
  tr.heading {
    background: #eee;
  }

  #nasty .funky > .crazy:first-child {
    table > tr.heading {
      border-top: 1px solid grey;
    }
  }
```

vendor.less
```css
  @import 'vendor';
  /*
   * @exclude
   * @file vendor.less
   * @selector '#nasty * tr.heading'
   */
  tr.heading {
    border-top: 1px solid #0f0f0f;
  }
```

result.css
```css
  tr.heading {
    background: #eee;
  }
  
  /*
   * @exclude
   * @file vendor.less
   * @selector '#nasty * tr.heading'
   */
  tr.heading {
    border-top: 1px solid #0f0f0f;
  }
```

## Usage

### Grunt

<img height=100 src="https://camo.githubusercontent.com/39242419c60a53e1f3cecdeecb2460acce47366f/687474703a2f2f6772756e746a732e636f6d2f696d672f6772756e742d6c6f676f2d6e6f2d776f72646d61726b2e737667">

As *css-exclude* is a [postcss]((https://github.com/postcss/postcss)) plugin it does **not** need a custom grunt plugin but 
can be used with the [grunt-postcss plugin](https://github.com/nDmitry/grunt-postcss).

```
$ npm install grunt-postcss css-exclude --save-dev
```

```js
grunt.initConfig({
  postcss: {
    options: {
      map: true,
      processors: [
        require('css-exclude').postcss
      ]
    },
    dist: {
      src: 'css/*.css'
    }
  }
});
```

### Gulp

<img height="100" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp.png">

As *css-exclude* is a [postcss]((https://github.com/postcss/postcss)) plugin it does **not** need a custom gulp plugin but 
can be used with the [gulp-postcss plugin](https://github.com/w0rm/gulp-postcss).

```
$ npm install gulp-postcss css-exclude --save-dev
```

```js
var postcss = require('gulp-postcss');
var gulp = require('gulp');
var cssExclude = require('css-exclude');

gulp.task('css', function () {
    var processors = [
        cssExclude()
    ];
    return gulp.src('./src/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dest'));
});
```

## Tests

[![Build Status](https://secure.travis-ci.org/jantimon/html-tpl-loader.svg?branch=master)](http://travis-ci.org/jantimon/html-tpl-loader)

Run unit tests:

```
  npm install
  npm test
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)


