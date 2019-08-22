const HOST_DIV_ID = 'lightstep_overlay';

export default function initialize(lightstepTracer, options = {}) {
    if (!lightstepTracer) {
        return;
    }

    if (typeof lightstepTracer.on !== 'function') {
        console.warn('Incompatible tracer object', tracer); // eslint-disable-line
        return;
    }

    let style = {
        right  : '2em',
        bottom : '2em',
    };
    if (options.bottom !== undefined) {
        style.bottom = options.bottom;
    }
    if (options.right !== undefined) {
        style.right = options.right;
    }

    lightstepTracer.on('report', (report) => {
        let spans = report.span_records;
        if (!spans || spans.length === 0) {
            return;
        }

        let link;
        let opts = lightstepTracer.options();
        let kMaxSpans = 4;
        let totalLinks = 0;

        // Make a guess about whether we are reporting to a dev instance or not
        // based on the ports being used.
        let url;
        if (opts.collector_port >= 9997 && opts.collector_port <= 9998) {
            url = `http://${window.location.hostname}:${window.location.port}/${opts.access_token}/`;
        } else {
            let host = opts.collector_host;
            if (host.match(/^collector[.-]/)) {
                host = host.replace(/^collector([.-])/, 'app$1');
            }
            url = `https://${host}/${opts.access_token}/`;
        }

        // Check if the element is there, as some in-page script might have
        // cleared the BODY, etc.
        let overlay = document.getElementById(HOST_DIV_ID);
        if (!overlay) {
            let container = document.createElement('a');
            container.href = `${url}explorer?q=tracer.guid:${spans[0].runtime_guid}`;
            container.className = 'lightstep-overlay-helper';
            container.style.position = 'fixed';
            container.style.bottom = style.bottom;
            container.style.right = style.right;
            container.style.width = '3em';
            container.style.height = '3em';
            container.style.borderRadius = '3em';
            container.style.cursor = 'pointer';
            container.style.background = 'rgb(0, 163, 255)';
            container.style.boxShadow = '0 0 0 1px #c4c4c4, 0 2px 20px 0 #e2e2e2';
            container.style.transition = '.25s all cubic-bezier(.38,-0.19,.62,1.23)';
            container.style.transform = 'scale(0)';
            container.style.opacity = '0';


            let btn = document.createElement('div');
            btn.style.width = '100%';
            btn.style.height = '100%';
            btn.style.display = 'block';
            btn.style.borderRadius = '3em';
            btn.style.background = 'linear-gradient(to bottom right,#00d6ff,#3b6fcb 90%)';
            btn.style.opacity = '0';
            btn.style.boxShadow = '0 0 0 0 transparent';
            btn.style.transition = '.2s all';

            let text = document.createElement('p');
            text.style.position = 'absolute';
            text.style.top = '0';
            text.style.left = '3.25em';
            text.style.lineHeight = '3em';
            text.style.fontFamily = '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif'; // eslint-disable-line
            text.style.color = '#FFF';
            text.style.opacity = '0';
            text.innerHTML = 'View traces';
            text.style.transition = '.2s all';

            let close = document.createElement('p');
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


            let logo = document.createElement('img');
            logo.src = '/static/images/logo-white.svg';
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
            let title = document.createElement('div');
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
        }


        for (let i = 0; i < overlay.childNodes.length; i++) {
            let child = overlay.childNodes[i];
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
        let joinedSpans = [];
        for (let i = 0; i < spans.length; i++) {
            joinedSpans.push({
                summary         : spans[i].span_name,
                oldest_micros   : spans[i].oldest_micros,
                youngest_micros : spans[i].youngest_micros,
                span_guid       : spans[i].span_guid,
            });
        }
        for (let i = 0; i < joinedSpans.length; i++) {
            for (let j = i + 1; j < joinedSpans.length; j++) {
                if ((joinedSpans[j].oldest_micros <= joinedSpans[i].youngest_micros &&
                     joinedSpans[j].youngest_micros >= joinedSpans[i].oldest_micros)) {
                    if (joinedSpans[j].oldest_micros < joinedSpans[i].oldest_micros) {
                        joinedSpans[i].summary = `${joinedSpans[j].summary}, ${joinedSpans[i].summary}`;
                        joinedSpans[i].oldest_micros = joinedSpans[j].oldest_micros;
                    } else {
                        joinedSpans[i].summary += `, ${joinedSpans[j].summary}`;
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
            totalLinks++;
        }
    });
}
