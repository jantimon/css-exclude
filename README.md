# css-exclude

[![Build Status](https://travis-ci.org/jantimon/css-exclude.svg)](https://travis-ci.org/jantimon/css-exclude)
[![NPM version](https://badge.fury.io/js/css-exclude.svg)](http://badge.fury.io/js/css-exclude)
[![Coverage Status](https://coveralls.io/repos/jantimon/css-exclude/badge.png)](https://coveralls.io/r/jantimon/css-exclude)
[![Dependency Status](https://david-dm.org/jantimon/css-exclude.png)](https://david-dm.org/jantimon/css-exclude)

## Motivation

Overwriting long selectors is a real pain and causes code which is hard to maintain.
**css-exclude** allows you to overwrite selectors with high specificity.

## Example

vendor.less
```css
  #nasty .funky > .crazy:first-child {
    table > tr.heading {
      border-top: 1px solid grey;
    }
  }
```

vendor.less
```css
  @import 'vendor'
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
  /*
   * @exclude
   * @file vendor.less
   * @selector '#nasty * tr.heading'
   */
  tr.heading {
    border-top: 1px solid #0f0f0f;
  }
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


