//
// Provide an HTML debug overlay DIV with status information about the running
// cruntime.
//
var gDebugOverlayEnabled = false;

// NOTE: this relies directly on the LightStep implementation and not on the
// OpenTracing APIs
updateDebugOverlay(Tracer.imp(), true);

const HOST_DIV_ID = 'lightstep_overlay';

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

    tracer.on("report", function(report) {
        let spans = report.span_records;
        if (!spans || spans.length === 0) {
            return;
        }

        let link, div;
        let opts = tracer.options();

        // Make a guess about whether we are reporting to a dev instance or not
        // based on the ports being used.
        let url;
        if (opts.collector_port >= 9997 && opts.collector_port <= 9998) {
            url = `http://${window.location.hostname}:${window.location.port}/${opts.access_token}/`;
        } else {
            let host = opts.collector_host;
            if (host.match(/^collector[.-]/)) {
                host = host.replace(/^collector([.-])/, "app$1")
            }
            url = `https://${host}/${opts.access_token}/`;
        }

        // Check if the element is there, as some in-page script might have
        // cleared the BODY, etc.
        var overlay = document.getElementById(HOST_DIV_ID);
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = HOST_DIV_ID;
            overlay.style.position = "fixed";
            overlay.style.bottom = "0";
            overlay.style.right = "0";
            overlay.style.width = "240px";
            overlay.style.height = "120px";
            overlay.style.padding = "4px";
            overlay.style.border = "solid 1px #FFF";
            overlay.style.backgroundColor = "#0060a2";
            overlay.style.color = "#FFF";
            overlay.style.fontSize = "12px";
            overlay.style.fontFamily = "sans-serif";
            overlay.style.opacity = "0.7";

            var close = document.createElement("div");
            close.style.float = "right";
            close.style.cursor = "pointer";
            close.style.color = "#FFF";
            close.onclick = function(evt) {
                overlay.style.display = "none";
            };
            close.innerHTML = "X";
            overlay.appendChild(close);

            link = document.createElement("a");
            link.href = url;
            link.style.color = "#FFF";
            link.style.fontWeight = "bold";
            link.appendChild( document.createTextNode("LightStep") );
            let title = document.createElement("div");
            title.appendChild(link);
            overlay.appendChild(title);

            document.body.appendChild(overlay);
        }

        let kMaxSpans = 4;
        let totalLinks = 0;

        for (let i = 0; i < overlay.childNodes.length; i++) {
            let child = overlay.childNodes[i];
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
        let joinedSpans = [];
        for (let i = 0; i < spans.length; i++) {
            joinedSpans.push({
                summary : spans[i].span_name,
                oldest_micros : spans[i].oldest_micros,
                youngest_micros : spans[i].youngest_micros,
                span_guid : spans[i].span_guid,
            });
        }
        for (let i = 0; i < joinedSpans.length; i++) {
            for (var j = i + 1; j < joinedSpans.length; j++) {
                if ((joinedSpans[j].oldest_micros <= joinedSpans[i].youngest_micros &&
                     joinedSpans[j].youngest_micros >= joinedSpans[i].oldest_micros)) {
                    if (joinedSpans[j].oldest_micros < joinedSpans[i].oldest_micros) {
                        joinedSpans[i].summary = joinedSpans[j].summary + ", " + joinedSpans[i].summary;
                        joinedSpans[i].oldest_micros = joinedSpans[j].oldest_micros;
                    } else {
                        joinedSpans[i].summary += ", " + joinedSpans[j].summary;
                    }
                    if (joinedSpans[j].youngest_micros > joinedSpans[i].youngest_micros) {
                        joinedSpans[i].youngest_micros = joinedSpans[j].youngest_micros;
                    }
                    joinedSpans[j] = joinedSpans[joinedSpans.length - 1];
                    joinedSpans = joinedSpans.slice(0, joinedSpans.length - 1);
                    j = i;
                }
            }
        }

        for (let i = 0; i < joinedSpans.length && totalLinks <= kMaxSpans; i++) {
            let span = joinedSpans[i];

            div = document.createElement("div");
            div.className = "lightstep_span";

            link = document.createElement("a");
            link.href = `${url}trace?span_guid=${span.span_guid}&at_micros=${span.youngest_micros}`;
            link.style.color = "#FFF";
            link.style.whiteSpace = "nowrap";
            link.appendChild(document.createTextNode(joinedSpans[i].summary));
            div.appendChild(link);

            overlay.appendChild(div);
            totalLinks++;
        }
    });
}
