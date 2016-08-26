'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = initialize;

var _opentracing = require('opentracing');

var _opentracing2 = _interopRequireDefault(_opentracing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HOST_DIV_ID = 'lightstep_overlay';

function initialize(tracer) {
    if (!tracer) {
        console.log('No tracer');
        return;
    }
    var tracerImp = tracer.imp();
    if (!tracerImp) {
        console.log('Tracer not inited');
        return;
    }

    console.log('Valid tracer');

    tracerImp.on('report', function (report) {
        var spans = report.span_records;
        if (!spans || spans.length === 0) {
            return;
        }

        var link = void 0;
        var opts = tracerImp.options();
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

// Try with the global Tracer automatically. It will safely do nothing if there's
// no global tracer and the client can explicitly initialize the overlay.
//
// NOTE: this relies directly on the LightStep implementation and not on the
// OpenTracing APIs
initialize(_opentracing2.default);

//# sourceMappingURL=overlay.js.map