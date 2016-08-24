var LightStepOverlay =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _opentracing = __webpack_require__(1);
	
	var _opentracing2 = _interopRequireDefault(_opentracing);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//
	// Provide an HTML debug overlay DIV with status information about the running
	// cruntime.
	//
	var gDebugOverlayEnabled = false;
	
	// NOTE: this relies directly on the LightStep implementation and not on the
	// OpenTracing APIs
	updateDebugOverlay(_opentracing2.default.imp(), true);
	
	var HOST_DIV_ID = 'lightstep_overlay';
	
	function updateDebugOverlay(tracer, enabled) {
	    // Ignore the case of debugging being enabled then disabled for
	    // reasons of engineering prioritization (not correctness!).
	    if (!enabled) {
	        return;
	    }
	    if (!tracer) {
	        return;
	    }
	    if (gDebugOverlayEnabled) {
	        return;
	    }
	
	    gDebugOverlayEnabled = true;
	
	    tracer.on('report', function (report) {
	        var spans = report.span_records;
	        if (!spans || spans.length === 0) {
	            return;
	        }
	
	        var link = void 0;
	        var opts = tracer.options();
	        var kMaxSpans = 4;
	        var totalLinks = 0;
	
	        // Make a guess about whether we are reporting to a dev instance or not
	        // based on the ports being used.
	        var url = void 0;
	        if (opts.collector_port >= 9997 && opts.collector_port <= 9998) {
	            url = 'http://' + window.location.hostname + ':' + window.location.port + '/' + opts.access_token + '/';
	        } else {
	            var host = opts.collector_host;
	            if (host.match(/^collector[.-]/)) {
	                host = host.replace(/^collector([.-])/, 'app$1');
	            }
	            url = 'https://' + host + '/' + opts.access_token + '/';
	        }
	
	        // Check if the element is there, as some in-page script might have
	        // cleared the BODY, etc.
	        var overlay = document.getElementById(HOST_DIV_ID);
	        if (!overlay) {
	            (function () {
	                var container = document.createElement('a');
	                container.href = url + 'latest?q=tracer.guid:' + spans[0].runtime_guid;
	                container.style.position = 'fixed';
	                container.style.bottom = '2em';
	                container.style.right = '2em';
	                container.style.width = '3em';
	                container.style.height = '3em';
	                container.style.borderRadius = '3em';
	                container.style.cursor = 'pointer';
	                container.style.background = 'rgb(0, 163, 255)';
	                container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
	                container.style.transition = '.25s all cubic-bezier(.38,-0.19,.62,1.23)';
	                container.style.transform = 'scale(0)';
	                container.style.opacity = '0';
	
	                var btn = document.createElement('div');
	                btn.style.width = '100%';
	                btn.style.height = '100%';
	                btn.style.display = 'block';
	                btn.style.borderRadius = '3em';
	                btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
	                btn.style.opacity = '0';
	                btn.style.boxShadow = '0 0 0 0 transparent';
	                btn.style.transition = '.2s all';
	
	                var text = document.createElement('p');
	                text.style.position = 'absolute';
	                text.style.top = '0';
	                text.style.left = '3.25em';
	                text.style.lineHeight = '3em';
	                text.style.fontFamily = '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif'; // eslint-disable-line
	                text.style.color = '#FFF';
	                text.style.opacity = '0';
	                text.innerHTML = 'View traces';
	                text.style.transition = '.2s all';
	
	                var close = document.createElement('p');
	                close.style.position = 'absolute';
	                close.style.top = '0';
	                close.style.right = '0';
	                close.style.width = '2em';
	                close.style.borderRadius = '0 3rem 3rem 0';
	                close.style.borderLeft = '1px solid rgba(0,0,0,.15)';
	                close.style.boxShadow = 'inset 1px 0 0 0 rgba(255,255,255,.2)';
	                close.style.lineHeight = '3rem';
	                close.style.color = '#FFF';
	                close.style.opacity = '0';
	                close.style.fontSize = '1.5rem';
	                close.style.textAlign = 'center';
	                close.innerHTML = '×';
	                close.style.transition = '.2s all';
	
	                var logo = document.createElement('img');
	                logo.src = 'http://imgur.com/brQx4rK.png';
	                logo.style.width = '2em';
	                logo.style.position = 'absolute';
	                logo.style.top = '.925em';
	                logo.style.left = '.5em';
	
	                container.onmouseenter = function (e) {
	                    btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
	                    btn.style.opacity = '1';
	                    container.style.boxShadow = 'rgb(196, 196, 196) 0px 0px 0px 1px, rgb(184, 184, 184) 0px 4px 30px 0px';
	                    container.style.opacity = '1';
	                    container.style.width = '12em';
	                    text.style.opacity = '.9';
	                    close.style.opacity = '.9';
	                    text.style.color = 'rgba(255,255,255,.6)';
	                    close.style.color = 'rgba(255,255,255,.6)';
	                };
	
	                container.onmouseleave = function (e) {
	                    btn.style.boxShadow = '0 0 0 0 transparent';
	                    btn.style.opacity = '0';
	                    container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
	                    container.style.width = '3em';
	                    text.style.opacity = '0';
	                    close.style.opacity = '0';
	                };
	
	                close.onmouseenter = function (e) {
	                    close.style.color = 'rgba(255,255,255,.9)';
	                    text.style.color = 'rgba(255,255,255,.6)';
	                };
	
	                close.onmouseleave = function (e) {
	                    close.style.color = 'rgba(255,255,255,.6)';
	                    text.style.color = 'rgba(255,255,255,.9)';
	                };
	
	                close.onclick = function (e) {
	                    e.preventDefault();
	                    e.stopPropagation();
	                    container.style.transform = 'scale(0)';
	                    container.style.opacity = '0';
	                };
	
	                container.appendChild(btn);
	                container.appendChild(logo);
	                container.appendChild(text);
	                container.appendChild(close);
	
	                overlay = document.createElement('div');
	                overlay.id = HOST_DIV_ID;
	                link = document.createElement('a');
	                link.href = url;
	                var title = document.createElement('div');
	                title.appendChild(link);
	                overlay.appendChild(title);
	
	                document.body.appendChild(overlay);
	                document.body.appendChild(container);
	
	                // Once all that stuff is done
	                // Note the getComputedStyle() call is necessary to force the DOM
	                // to update the element so the animation looks correct
	                container.style.opacity = '0';
	                window.getComputedStyle(container).opacity; // eslint-disable-line no-unused-expressions
	
	                container.style.transform = 'scale(1)';
	                container.style.opacity = '1';
	            })();
	        }
	
	        for (var i = 0; i < overlay.childNodes.length; i++) {
	            var child = overlay.childNodes[i];
	            if (child.className === 'lightstep_span') {
	                totalLinks++;
	            }
	        }
	        // If we've already added kMaxSpans+1 lines below the
	        // 'header', then don't add anything else.
	        if (totalLinks > kMaxSpans) {
	            return;
	        }
	
	        // Do a primitive trace joining here: only show one link per
	        // trace (i.e. one link per set of spans that will be
	        // combined). We make the (possibly not true) assumptions that
	        // all spans in a trace will arrive in the same event and that
	        // all span share a join id (just to keep things simple).
	        var joinedSpans = [];
	        for (var _i = 0; _i < spans.length; _i++) {
	            joinedSpans.push({
	                summary: spans[_i].span_name,
	                oldest_micros: spans[_i].oldest_micros,
	                youngest_micros: spans[_i].youngest_micros,
	                span_guid: spans[_i].span_guid
	            });
	        }
	        for (var _i2 = 0; _i2 < joinedSpans.length; _i2++) {
	            for (var j = _i2 + 1; j < joinedSpans.length; j++) {
	                if (joinedSpans[j].oldest_micros <= joinedSpans[_i2].youngest_micros && joinedSpans[j].youngest_micros >= joinedSpans[_i2].oldest_micros) {
	                    if (joinedSpans[j].oldest_micros < joinedSpans[_i2].oldest_micros) {
	                        joinedSpans[_i2].summary = joinedSpans[j].summary + ', ' + joinedSpans[_i2].summary;
	                        joinedSpans[_i2].oldest_micros = joinedSpans[j].oldest_micros;
	                    } else {
	                        joinedSpans[_i2].summary += ', ' + joinedSpans[j].summary;
	                    }
	                    if (joinedSpans[j].youngest_micros > joinedSpans[_i2].youngest_micros) {
	                        joinedSpans[_i2].youngest_micros = joinedSpans[j].youngest_micros;
	                    }
	                    joinedSpans[j] = joinedSpans[joinedSpans.length - 1];
	                    joinedSpans = joinedSpans.slice(0, joinedSpans.length - 1);
	                    j = _i2;
	                }
	            }
	        }
	
	        for (var _i3 = 0; _i3 < joinedSpans.length && totalLinks <= kMaxSpans; _i3++) {
	            totalLinks++;
	        }
	    });
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports=function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";e.exports=n(1)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var i=n(2),u=r(i);e.exports=new u["default"]},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function i(e){return e&&e.__esModule?e:{"default":e}}function u(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var f=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(3),c=i(l),s=n(6),p=r(s),d=n(8),h=i(d),_=n(7),y=i(_),v=function(e){function t(){u(this,t);var e=o(this,Object.getPrototypeOf(t).call(this));for(var n in p)e[n]=p[n];return e.Reference=y["default"],e.BinaryCarrier=h["default"],e}return a(t,e),f(t,[{key:"initGlobalTracer",value:function(e){this._imp=e,e&&e.setInterface(this)}},{key:"initNewTracer",value:function(e){var t=new c["default"](e);return e&&e.setInterface(this),t}}]),t}(c["default"]);t["default"]=v,e.exports=t["default"]},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(4),a=r(o),f=n(5),l=r(f),c=n(6),s=r(c),p=n(7),d=r(p),h=function(){function e(t){i(this,e),this._imp=t||null}return u(e,[{key:"startSpan",value:function(e,t){var n=null;if(this._imp){if(1===arguments.length?t="string"==typeof e?{operationName:e}:e:t.operationName=e,t.childOf){var r=this.childOf(t.childOf);t.references?t.references.push(r):t.references=[r],delete t.childOf}n=this._imp.startSpan(t)}return new a["default"](n)}},{key:"childOf",value:function(e){return new d["default"](s["default"].REFERENCE_CHILD_OF,e)}},{key:"followsFrom",value:function(e){return new d["default"](s["default"].REFERENCE_FOLLOWS_FROM,e)}},{key:"inject",value:function(e,t,n){this._imp&&(e instanceof a["default"]&&(e=e.context()),this._imp.inject(e._imp,t,n))}},{key:"extract",value:function(e,t){var n=null;return this._imp&&(n=this._imp.extract(e,t)),null!==n?new l["default"](n):null}},{key:"flush",value:function(e){return this._imp?void this._imp.flush(e):void e(null)}}]),u(e,[{key:"imp",value:function(){return this._imp}}]),e}();t["default"]=h,e.exports=t["default"]},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function u(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(3),f=r(a),l=n(5),c=r(l),s=n(1),p=function(){function e(t){u(this,e),this._imp=t}return o(e,[{key:"context",value:function(){var e=null;return this._imp&&(e=this._imp.context()),new c["default"](e)}},{key:"tracer",value:function(){return this._imp?new f["default"](this._imp.tracer()):s}},{key:"setOperationName",value:function(e){return this._imp&&this._imp.setOperationName(e),this}},{key:"setTag",value:function(e,t){return this.addTags(i({},e,t)),this}},{key:"addTags",value:function(e){if(this._imp)return this._imp.addTags(e),this}},{key:"log",value:function(e){if(this._imp)return this._imp.log(e),this}},{key:"logEvent",value:function(e,t){return this.log({event:e,payload:t})}},{key:"finish",value:function(e){this._imp&&this._imp.finish(e)}}]),o(e,[{key:"imp",value:function(){return this._imp}}]),e}();t["default"]=p,e.exports=t["default"]},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=function(){function e(t){r(this,e),this._imp=t}return i(e,[{key:"setBaggageItem",value:function(e,t){this._imp&&this._imp.setBaggageItem(e,t)}},{key:"getBaggageItem",value:function(e){if(this._imp)return this._imp.getBaggageItem(e)}}]),i(e,[{key:"imp",value:function(){return this._imp}}]),e}();t["default"]=u,e.exports=t["default"]},function(e,t){"use strict";e.exports={FORMAT_BINARY:"binary",FORMAT_TEXT_MAP:"text_map",FORMAT_HTTP_HEADERS:"http_headers",REFERENCE_CHILD_OF:"child_of",REFERENCE_FOLLOWS_FROM:"follows_from"}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(4),a=r(o),f=n(5),l=(r(f),function(){function e(t,n){i(this,e),this._type=t,this._referencedContext=n instanceof a["default"]?n.context():n}return u(e,[{key:"type",value:function(){return this._type}},{key:"referencedContext",value:function(){return this._referencedContext}}]),e}());t["default"]=l,e.exports=t["default"]},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function i(e){n(this,i),this.buffer=e};t["default"]=r,e.exports=t["default"]}]);

/***/ }
/******/ ]);
//# sourceMappingURL=lightstep-overlay.js.map