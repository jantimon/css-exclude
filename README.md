# css-exclude

[![Build Status](https://travis-ci.org/jantimon/css-exclude.svg)](https://travis-ci.org/jantimon/css-exclude)
[![NPM version](https://badge.fury.io/js/css-exclude.svg)](http://badge.fury.io/js/css-exclude)
[![Coverage Status](https://coveralls.io/repos/jantimon/css-exclude/badge.png)](https://coveralls.io/r/jantimon/css-exclude)
[![Code Climate](https://codeclimate.com/github/jantimon/css-exclude/badges/gpa.svg)](https://codeclimate.com/github/jantimon/css-exclude)
[![Dependency Status](https://david-dm.org/jantimon/css-exclude.png)](https://david-dm.org/jantimon/css-exclude)

**get rid of ugly third party selectors**

## Motivation

Overwriting long selectors is a pain and might cause unmaintainable code.  
*css-exclude* is a post processor that allows you to choose which of those selectors don't belong in your final stylehsheet.  
Just by writing a css comment.

## How does it work?

*css-exclude* is a [postcss](https://github.com/postcss/postcss) processor like other famous modules e.g. autoprefixer or webpcss.
It supports vanilla css and any preprocessor which supports inline source maps.
For more information on compatibility take a look at the [tests for **vanilla css**, **sass** and **less**](https://github.com/jantimon/css-exclude/tree/master/test)


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

main.less
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

<img height="100" src="https://camo.githubusercontent.com/39242419c60a53e1f3cecdeecb2460acce47366f/687474703a2f2f6772756e746a732e636f6d2f696d672f6772756e742d6c6f676f2d6e6f2d776f72646d61726b2e737667">

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
        require('css-exclude')({debug: true}).postcss
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

gulp.task('css', function () {
    var processors = [
        require('css-exclude')({debug: true})
    ];
    return gulp.src('./src/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dest'));
});
```

## Tests

[![Build Status](https://secure.travis-ci.org/jantimon/html-tpl-loader.svg?branch=master)](http://travis-ci.org/jantimon/html-tpl-loader)
[![Coverage Status](https://coveralls.io/repos/jantimon/css-exclude/badge.png)](https://coveralls.io/r/jantimon/css-exclude)

Run unit tests:

```
  npm install
  npm test
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)


