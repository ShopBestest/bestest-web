/* not-on-bestest.js — "this model isn't Bestest material" page (/not-bestest).
   Renders into <div id="bst-notcarried"></div>. Reads ?make=&model= from the URL.
   Looks up the model's segment from the roster (feed worker /?roster) and either:
     - GRAPH segments: renders the "Bestest Cars are Better" pillar graph (Bestest vs
       Other, 4 pillars, Other as % of Bestest), then two CTA cards; or
     - FALLBACK segments (luxury sedans/SUVs, EVs where the gap inverts): copy + CTAs only.
   Page should be noindex in Webflow; this also injects a robots meta as backup.
   Embed before </body>:
   <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/not-on-bestest.js" defer></script>

   The SEGMENTS table below is regenerated from Model Scoring whenever the scoring
   re-runs (graph_data_by_mm_segment.json). `g` = [Critics, Internal, Reliability,
   Resale] as Other-% -of-Bestest; a segment graphs only if `g` is present AND every
   value is <= 100 (Bestest equal-or-better on all four). No `g` = copy-only fallback.
*/
(function () {
  var MOUNT = document.getElementById('bst-notcarried');
  if (!MOUNT) return;

  if (!document.querySelector('meta[name="robots"]')) {
    var m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex, follow';
    document.head.appendChild(m);
  }

  var GREEN = '#1a6f4a';
  var FEED = (window.BS_FEED_URL || 'https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/') + '?roster';

  // MM segment -> { plural (display), url (SRP), g:[Crit,Intl,Rel,Res] Other% (omit = fallback) }
  var SEGMENTS = {
    'Compact Car':            { plural: 'Compact Cars',          url: '/used-cars/best-used-compact-cars',            g: [96, 91, 79, 99] },
    'Midsize/Full-size Car':  { plural: 'Midsize Cars',          url: '/used-cars/best-used-midsize-cars',            g: [82, 85, 97, 87] },
    'Subcompact SUV':         { plural: 'Subcompact SUVs',       url: '/used-cars/best-used-subcompact-suvs',         g: [89, 88, 78, 91] },
    'Compact SUV':            { plural: 'Compact SUVs',          url: '/used-cars/best-used-compact-suvs',            g: [92, 91, 87, 83] },
    'Midsize SUV':            { plural: 'Midsize SUVs',          url: '/used-cars/best-used-midsize-suvs',            g: [91, 90, 77, 87] },
    'Full-Size SUV':          { plural: 'Full-Size SUVs',        url: '/used-cars/best-used-full-size-suvs',          g: [96, 96, 83, 87] },
    'Compact/Midsize Truck':  { plural: 'Midsize Trucks',        url: '/used-cars/best-used-midsize-trucks',          g: [98, 99, 70, 95] },
    'Full-Size Truck':        { plural: 'Full-Size Trucks',      url: '/used-cars/best-used-full-size-trucks' },
    'Minivan':                { plural: 'Minivans',              url: '/used-cars/best-used-minivans',                g: [94, 97, 59, 74] },
    'Luxury Subcompact SUV':  { plural: 'Luxury Subcompact SUVs',url: '/used-cars/best-used-luxury-subcompact-suvs',  g: [94, 92, 96, 94] },
    'Luxury Compact SUV':     { plural: 'Luxury Compact SUVs',   url: '/used-cars/best-used-luxury-compact-suvs',     g: [90, 92, 89, 89] },
    'Luxury Midsize SUV':     { plural: 'Luxury Midsize SUVs',   url: '/used-cars/best-used-luxury-midsize-suvs',     g: [91, 90, 81, 88] },
    'Luxury Full-Size SUV':   { plural: 'Luxury Full-Size SUVs', url: '/used-cars/best-used-luxury-full-size-suvs' },
    'Luxury Small Car':       { plural: 'Luxury Small Cars',     url: '/used-cars/best-used-luxury-small-cars' },
    'Luxury Midsize Car':     { plural: 'Luxury Midsize Cars',   url: '/used-cars/best-used-luxury-midsize-cars' },
    'Luxury Full-Size Car':   { plural: 'Luxury Full-Size Cars', url: '/used-cars/best-used-luxury-full-size-cars' },
    'Electric Vehicles':      { plural: 'Electric Vehicles',     url: '/used-cars/best-used-electric-vehicles' }
  };

  function param(k) { var v = new URLSearchParams(window.location.search).get(k); return v ? v.trim() : ''; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function lower(s) { return (s || '').toLowerCase(); }

  var make = param('make'), model = param('model');
  var name = (make + ' ' + model).trim();
  var nameHTML = name ? esc(name) : 'This car';
  var UTM = '?utm_source=shopbestest&utm_medium=referral&utm_campaign=not_bestest';
  var autotrader = ((make && model)
    ? 'https://www.autotrader.com/cars-for-sale/' + slug(make) + '/' + slug(model)
    : 'https://www.autotrader.com/cars-for-sale/all-cars') + UTM;

  // GA4 outbound tracking (house style: guarded window.gtag, per lead-form.js).
  function track(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
  }

  var EXT = '<svg class="bst-nc-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

  function graphSVG(seg) {
    var g = seg.g, XS = [70, 277, 483, 690], LBL = ['Critics', 'Internal', 'Reliability', 'Resale'];
    var ys = g.map(function (v) { return 38 + (100 - v) * 3.6; });
    var maxY = Math.max.apply(null, ys), maxI = ys.indexOf(maxY);
    var pts = XS.map(function (x, i) { return x + ',' + ys[i].toFixed(1); }).join(' ');
    var poly = '70,38 690,38 690,' + ys[3].toFixed(1) + ' 483,' + ys[2].toFixed(1) +
               ' 277,' + ys[1].toFixed(1) + ' 70,' + ys[0].toFixed(1);
    var gapX = Math.min(560, Math.max(150, XS[maxI]));
    var gapY = Math.min(90, Math.max(55, (38 + maxY) / 2));
    var othX = Math.min(585, Math.max(175, XS[maxI]));
    var othY = Math.min(205, maxY + 26);
    var axis = LBL.map(function (l, i) { return '<text x="' + XS[i] + '" y="240">' + l + '</text>'; }).join('');
    return '<svg viewBox="0 0 760 250" width="100%" role="img" aria-label="Bestest ' + esc(lower(seg.plural)) +
        ' versus other ' + esc(lower(seg.plural)) + ' across critics, internal, reliability and resale.">' +
      '<line x1="70" y1="38" x2="690" y2="38" stroke="#eee"/><line x1="70" y1="218" x2="690" y2="218" stroke="#eee"/>' +
      '<text x="56" y="42" text-anchor="end" font-size="12" fill="#9a988f">100%</text>' +
      '<text x="56" y="222" text-anchor="end" font-size="12" fill="#9a988f">50%</text>' +
      '<polygon points="' + poly + '" fill="#ebe9e5"/>' +
      '<text x="' + gapX + '" y="' + gapY.toFixed(0) + '" text-anchor="middle" font-size="15" font-weight="600" fill="#6f6d64">Gap</text>' +
      '<polyline points="' + pts + '" fill="none" stroke="#3d3d3b" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<line x1="70" y1="38" x2="690" y2="38" stroke="#45a06a" stroke-width="4.5" stroke-linecap="round"/>' +
      '<text x="150" y="29" font-size="14" font-weight="700" fill="#3f9d67">Bestest ' + esc(seg.plural) + '</text>' +
      '<text x="' + othX + '" y="' + othY.toFixed(0) + '" text-anchor="middle" font-size="14" font-weight="600" fill="#66645e">Other ' + esc(seg.plural) + '</text>' +
      '<g font-size="13" fill="#555" text-anchor="middle">' + axis + '</g></svg>';
  }

  function render(seg) {
    // A segment graphs only if it has g AND Bestest is equal-or-better on all four pillars.
    var doGraph = seg && seg.g && seg.g.every(function (v) { return v <= 100; });
    var srpUrl = (seg && seg.url) || '/used-cars';
    var betterCta = seg
      ? 'Shop the Bestest ' + esc(lower(seg.plural))
      : 'Shop the best used cars on Bestest';

    var graphBlock = doGraph
      ? '<div class="bst-nc-graph"><p class="bst-nc-gh">Bestest Cars are Better</p>' + graphSVG(seg) + '</div>'
      : '';

    MOUNT.innerHTML =
      '<section class="bst-nc">' +
        '<h1 class="bst-nc-title">The <strong>' + nameHTML + '</strong> isn’t Bestest material.</h1>' +
        '<p class="bst-nc-body">The cars we don’t allow on Bestest aren’t necessarily bad cars, they’re just not among the segment’s best cars. Founded by the former head of vehicle reviews and ratings at Kelley Blue Book, the only cars you’ll find on Bestest are the same ones that earn consistently high marks across trusted sources ranging from Consumer Reports to Car and Driver.</p>' +
        '<p class="bst-nc-body">Bestest is the used-car marketplace designed for quality-focused, Nordstrom-type shoppers who don’t want to bother with anything but the good stuff.</p>' +
        graphBlock +
        '<div class="bst-nc-ctas">' +
          '<div class="bst-nc-card bst-nc-card-alt">' +
            '<p class="bst-nc-h">Still want ' + (name ? 'a' + (/^[aeiou]/i.test(make) ? 'n' : '') + ' ' + nameHTML : 'this one') + '?</p>' +
            '<a class="bst-nc-cta bst-nc-cta-out" href="' + autotrader + '" target="_blank" rel="noopener nofollow">' +
              'Shop ' + (model ? esc(model) : 'used cars') + ' on Autotrader ' + EXT + '</a>' +
          '</div>' +
          '<div class="bst-nc-card bst-nc-card-best">' +
            '<p class="bst-nc-h">Want something better?</p>' +
            '<a class="bst-nc-cta bst-nc-cta-primary" href="' + srpUrl + '">' + betterCta + ' →</a>' +
          '</div>' +
        '</div>' +
      '</section>';
    injectStyles();
    var outLink = MOUNT.querySelector('.bst-nc-cta-out');
    if (outLink) {
      outLink.addEventListener('click', function () {
        track('outbound_autotrader', { make: make, model: model, segment: (seg && seg.plural) || '', source_page: 'not_bestest' });
      });
    }
  }

  function lookupSegmentAndRender() {
    if (!make || !model) { render(null); return; }
    var key = slug(make + '-' + model);
    var done = false;
    function fin(seg) { if (done) return; done = true; render(seg); }
    // safety timeout so a slow/broken feed never leaves a blank page
    var t = setTimeout(function () { fin(null); }, 4000);
    fetch(FEED).then(function (r) { return r.json(); }).then(function (d) {
      clearTimeout(t);
      var models = (d && d.models) || {};
      var entry = models[key];
      var segName = entry && entry.seg;
      fin(segName ? SEGMENTS[segName] : null);
    }).catch(function () { clearTimeout(t); fin(null); });
  }

  function injectStyles() {
    if (document.getElementById('bst-nc-styles')) return;
    var s = document.createElement('style'); s.id = 'bst-nc-styles';
    s.textContent =
      ".bst-nc, .bst-nc * { font-family: 'Montserrat', sans-serif; }" +
      ".bst-nc{max-width:720px;margin:0 auto;padding:8px 0 40px;color:#1a1a1a;}" +
      ".bst-nc-title{font-size:30px;line-height:1.2;font-weight:700;margin:0 0 16px;}" +
      ".bst-nc-body{font-size:16.5px;line-height:1.6;color:#333;margin:0 0 22px;}" +
      ".bst-nc-graph{background:#faf9f6;border:0.5px solid #e7e5dd;border-radius:12px;padding:18px 16px 8px;margin:0 0 26px;}" +
      ".bst-nc-gh{font-size:16px;font-weight:700;color:" + GREEN + ";margin:0 0 2px;text-align:center;}" +
      ".bst-nc-ctas{display:grid;grid-template-columns:1fr 1fr;gap:16px;}" +
      ".bst-nc-card{border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px;}" +
      ".bst-nc-card-alt{background:#f7f6f2;}" +
      ".bst-nc-card-best{background:#f0f7f2;}" +
      ".bst-nc-h{font-size:16.5px;font-weight:700;margin:0;line-height:1.25;}" +
      ".bst-nc-card-alt .bst-nc-h{color:#8a877e;}" +
      ".bst-nc-card-best .bst-nc-h{color:" + GREEN + ";}" +
      ".bst-nc-cta{margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:7px;text-align:center;font-size:14.5px;font-weight:600;text-decoration:none;padding:12px 16px;border-radius:10px;line-height:1.3;}" +
      ".bst-nc-cta-primary{background:" + GREEN + ";color:#fff;}" +
      ".bst-nc-cta-primary:hover{background:#155539;}" +
      ".bst-nc-cta-out{background:#fff;color:#66645e;border:1px solid #ddd9cf;}" +
      ".bst-nc-cta-out:hover{background:#f2f0e9;}" +
      ".bst-nc-ext{width:14px;height:14px;flex-shrink:0;}" +
      "@media(max-width:600px){.bst-nc-title{font-size:24px;}.bst-nc-body{font-size:16px;}.bst-nc-ctas{grid-template-columns:1fr;}}";
    document.head.appendChild(s);
  }

  lookupSegmentAndRender();
})();
