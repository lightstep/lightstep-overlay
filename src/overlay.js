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

        let link, logo, div, count;
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
        
            let container = document.createElement('div');
            container.style.position = "fixed";
            container.style.bottom = "2em";
            container.style.right = "2em";
            container.style.width = "3em";
            container.style.height = "3em";
            container.style.borderRadius = "3em";
            container.style.cursor = "pointer";
            container.style.background = 'rgb(0, 163, 255)';
            container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
            container.style.transition = '.5s all';


            let btn = document.createElement('div');
            btn.style.width = '100%';
            btn.style.height = '100%';
            btn.style.borderRadius = "3em";
            btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
            btn.style.opacity = '0';
            btn.style.boxShadow = '0 0 0 0 transparent';
            btn.style.transition = '.5s all';

            let badge = document.createElement('div');
            badge.style.width = '.75em';
            badge.style.height = '.75em';
            badge.style.borderRadius = '1em';
            badge.style.background = 'red';
            badge.style.position = 'absolute';
            badge.style.top = '0em';
            badge.style.right = '0em';


            container.onmouseenter = function(e) {
              btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
              btn.style.boxShadow = 'inset 0 0 0 2px #FFF, inset 0 0 0 3px rgb(29, 184, 228)';
              btn.style.opacity = '1'
              container.style.boxShadow = 'rgb(196, 196, 196) 0px 0px 0px 1px, rgb(184, 184, 184) 0px 4px 30px 0px';
              container.style.opacity = '1'
            };
            
            container.onmouseleave = function(e) {
              btn.style.boxShadow = '0 0 0 0 transparent';
              btn.style.opacity = '0';
            container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
              container.style.opacity = '.9'
            };


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


            container.appendChild(btn);
            container.appendChild(logo);
            container.appendChild(count);

            overlay = document.createElement("div");
            var close = document.createElement("div");
            link = document.createElement("a");
            link.href = url;
            let title = document.createElement("div");
            title.appendChild(link);
            title.appendChild(close);
            overlay.appendChild(title);

            document.body.appendChild(overlay);
            document.body.appendChild(container);
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
            link.style.color = "#e0e0e0";
            link.style.padding = '.5em';
            link.style.lineHeight = '1.25em';
            link.style.display = 'block';
            link.appendChild(document.createTextNode(joinedSpans[i].summary));
            div.appendChild(link);

            overlay.appendChild(div);
            totalLinks++;
            console.log(totalLinks)
            count.innerHTML = totalLinks;
        }
    });
}