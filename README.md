# lightstep-overlay

[![npm version](https://badge.fury.io/js/lightstep-overlay.svg)](https://badge.fury.io/js/lightstep-overlay)
[![Circle CI](https://circleci.com/gh/lightstep/lightstep-overlay.svg?style=shield)](https://circleci.com/gh/lightstep/lightstep-overlay)
[![MIT license](http://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)

An in-browser, development overlay that provides links to real-time tracing data.

![example](doc/example.gif)

### Installation

#### Using the script directly

The [lightstep-overlay.min.js](dist/lightstep-overlay.min.js) file can be downloaded and included in your HTML page directly:

```html
<script src="lightstep-overlay.min.js"></script>
```

The overlay automatically hooks into the global tracer to determine the tracing configuration.

#### Via NPM:

```bash
npm install --save lightstep-overlay
```

The overlay script will be located in `node_modules/dist/lightstep-overlay.min.js`. Include the script in your HTML via whatever mechanism works best for your web application.

#### Using as a module

The source is compiled down to ES5 code in unbundled form into the `lib` directory. The `package.json` main entry-point uses this code.
