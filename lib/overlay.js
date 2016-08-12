"use strict";

//
// Provide an HTML debug overlay DIV with status information about the running
// cruntime.
//
var gDebugOverlayEnabled = false;

// NOTE: this relies directly on the LightStep implementation and not on the
// OpenTracing APIs
updateDebugOverlay(Tracer.imp(), true);

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

    tracer.on("report", function (report) {
        var spans = report.span_records;
        if (!spans || spans.length === 0) {
            return;
        }

        var container = void 0,
            link = void 0,
            logo = void 0,
            div = void 0,
            count = void 0;
        var opts = tracer.options();
        var kMaxSpans = 4;
        var totalLinks = 0;

        // Make a guess about whether we are reporting to a dev instance or not
        // based on the ports being used.
        var url = void 0;
        if (opts.collector_port >= 9997 && opts.collector_port <= 9998) {
            url = "http://" + window.location.hostname + ":" + window.location.port + "/" + opts.access_token + "/";
        } else {
            var host = opts.collector_host;
            if (host.match(/^collector[.-]/)) {
                host = host.replace(/^collector([.-])/, "app$1");
            }
            url = "https://" + host + "/" + opts.access_token + "/";
        }

        // Check if the element is there, as some in-page script might have
        // cleared the BODY, etc.
        var overlay = document.getElementById(HOST_DIV_ID);
        if (!overlay) {
            var close;

            (function () {

                container = document.createElement('a');
                container.href = url + 'latest?q=tracer.guid:' + spans[0].runtime_guid;
                container.style.position = "fixed";
                container.style.bottom = "2em";
                container.style.right = "2em";
                container.style.width = "3em";
                container.style.height = "3em";
                container.style.borderRadius = "3em";
                container.style.cursor = "pointer";
                container.style.background = 'rgb(0, 163, 255)';
                container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
                container.style.transition = '.2s all';
                container.style.transform = 'scale(0)';
                container.style.opacity = '0';

                var btn = document.createElement('div');
                btn.style.width = '100%';
                btn.style.height = '100%';
                btn.style.display = 'block';
                btn.style.borderRadius = "3em";
                btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
                btn.style.opacity = '0';
                btn.style.boxShadow = '0 0 0 0 transparent';
                btn.style.transition = '.5s all';

                var badge = document.createElement('div');
                badge.style.width = '.75em';
                badge.style.height = '.75em';
                badge.style.borderRadius = '1em';
                badge.style.background = 'red';
                badge.style.position = 'absolute';
                badge.style.top = '0em';
                badge.style.right = '0em';

                logo = document.createElement('img');
                logo.src = 'http://imgur.com/brQx4rK.png';
                logo.style.width = '2em';
                logo.style.position = 'absolute';
                logo.style.top = '.925em';
                logo.style.left = '.5em';

                count = document.createElement('div');
                count.style.fontSize = '.75em';
                count.style.position = 'absolute';
                count.style.top = '-.4rem';
                count.style.right = '-.4rem';
                count.style.minWidth = '1.2rem';
                count.style.height = '1.2rem';
                count.style.paddingTop = '.2rem';
                count.style.borderRadius = '1.2em';
                count.style.textAlign = 'center';
                count.style.backgroundColor = '#ff7a7a';
                count.style.color = '#FFF';

                container.onmouseenter = function (e) {
                    btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
                    btn.style.boxShadow = 'inset 0 0 0 2px #FFF, inset 0 0 0 3px rgb(29, 184, 228)';
                    btn.style.opacity = '1';
                    container.style.boxShadow = 'rgb(196, 196, 196) 0px 0px 0px 1px, rgb(184, 184, 184) 0px 4px 30px 0px';
                    container.style.opacity = '1';
                    count.innerHTML = 'x';
                };

                container.onmouseleave = function (e) {
                    btn.style.boxShadow = '0 0 0 0 transparent';
                    btn.style.opacity = '0';
                    container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
                    container.style.opacity = '.9';
                    count.innerHTML = totalLinks;
                };

                count.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    container.style.transform = 'scale(0)';
                    container.style.opacity = '0';
                };

                container.appendChild(btn);
                container.appendChild(logo);
                container.appendChild(count);

                overlay = document.createElement("div");
                overlay.id = HOST_DIV_ID;
                close = document.createElement("div");

                link = document.createElement("a");
                link.href = url;
                var title = document.createElement("div");
                title.appendChild(link);
                title.appendChild(close);
                overlay.appendChild(title);

                document.body.appendChild(overlay);
                document.body.appendChild(container);

                //once all that stuff is done
                container.style.opacity = '0';

                window.getComputedStyle(container).opacity;

                container.style.transform = 'scale(1)';
                container.style.opacity = '1';
            })();
        }

        for (var i = 0; i < overlay.childNodes.length; i++) {
            var child = overlay.childNodes[i];
            if (child.className == "lightstep_span") {
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
                        joinedSpans[_i2].summary = joinedSpans[j].summary + ", " + joinedSpans[_i2].summary;
                        joinedSpans[_i2].oldest_micros = joinedSpans[j].oldest_micros;
                    } else {
                        joinedSpans[_i2].summary += ", " + joinedSpans[j].summary;
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
            var span = joinedSpans[_i3];

            totalLinks++;
            count.innerHTML = totalLinks;
        }
    });
}

//# sourceMappingURL=overlay.js.map