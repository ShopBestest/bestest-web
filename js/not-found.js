/* not-found.js — the Webflow 404 page, with a smart sold-car view (2026-11-03).
   Sold VDPs hard-404 by design (status 404 + noindex stay). When the missing URL is a VDP
   (/used/{year}-{make}-{model}[-{trim}]-{vin6}), this replaces the generic 404 markup with:
     1. "That {year} {make} {model} {trim} was one of the best {model}s for sale in Orange County"
     2. "But here are the others!" + the three closest live cars of the same model (trim, then
        powertrain, then year, then 15+ photos, then newest arrival); segment cars if none live
     3. "See all Bestest {model}s" (right-aligned)
     4. "Bestest isn't like other used-car listing sites." + descriptor (Jason's copy, 11/3)
     5. Dual bar: "Only 38 of the 354 used Toyota RAV4s for sale in Orange County qualify as Bestest"
     6. Dual bar: "Only 7 of the 13 compact SUVs qualify as Bestest", the models listed under each side
     7. "Browse all 137 compact SUVs on Bestest"
   Any other missing URL keeps the generic markup the page ships with.

   Data (all from the feed Worker, CORS *):
     /           live feed (reuses srp-engine.js's sessionStorage copy when present)
     /?roster    make/model roster: s (A in, B out), seg, p (model page), c (core segment peer)
     /?oc        weekly OC used counts {date, total, m: {model: count}} (oc-market/oc_counts_kv.py)
   The segment bar uses the core roster (c) when the segment has one; else every in/out model.
   The 354 bar is skipped when the model is below the weekly facet cap (~40 listings), /?oc is unavailable,
   or Bestest holds more than half the market ("Only 52 of the 83" would mislead). Segments without a
   core roster list every in/out model, up to 24; past that the segment bar is skipped.

   Webflow 404 page: one HTML embed holding the generic fallback inside <div id="bst-404"> plus
     <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/not-found.js" defer></script>
   (staged copy: Bestest Project Folder/staged/webflow-404-page-2026-11-03/embed.html).

   GA4 (guarded window.gtag; registered dims vehicle_make, vehicle_model, segment, source_page):
     sold_404_view        on render: vehicle_*, segment, cars_shown, card_scope (model|segment|none)
     similar_from_404     card click: + position, vin6 (slug tail)
     sold_404_see_all     "See all Bestest {model}s"
     sold_404_model_click a model name under the segment bar: + clicked_model, on_bestest (yes|no)
     sold_404_browse      "Browse all … on Bestest"
     sold_404_how         "How we pick"
*/
(function () {
  var MOUNT = document.getElementById('bst-404');

  if (!document.querySelector('meta[name="robots"]')) {
    var m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex';
    document.head.appendChild(m);
  }
  if (!MOUNT) return;

  var BASE = (typeof window.BS_FEED_URL === 'string' && window.BS_FEED_URL) || 'https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/';
  var FEED_CACHE_KEY = 'bestest_feed_cache_v3', FEED_TTL = 60 * 60 * 1000; // srp-engine.js's cache

  // Roster segment -> display plural + SRP (mirrors not-on-bestest.js SEGMENTS).
  var SEGMENTS = {
    'Compact Car':            { plural: 'Compact Cars',           url: '/used-cars/best-used-compact-cars' },
    'Midsize/Full-size Car':  { plural: 'Midsize Cars',           url: '/used-cars/best-used-midsize-cars' },
    'Subcompact SUV':         { plural: 'Subcompact SUVs',        url: '/used-cars/best-used-subcompact-suvs' },
    'Compact SUV':            { plural: 'Compact SUVs',           url: '/used-cars/best-used-compact-suvs' },
    'Midsize SUV':            { plural: 'Midsize SUVs',           url: '/used-cars/best-used-midsize-suvs' },
    'Full-Size SUV':          { plural: 'Full-Size SUVs',         url: '/used-cars/best-used-full-size-suvs' },
    'Compact/Midsize Truck':  { plural: 'Midsize Trucks',         url: '/used-cars/best-used-midsize-trucks' },
    'Full-Size Truck':        { plural: 'Full-Size Trucks',       url: '/used-cars/best-used-full-size-trucks' },
    'Minivan':                { plural: 'Minivans',               url: '/used-cars/best-used-minivans' },
    'Luxury Subcompact SUV':  { plural: 'Luxury Subcompact SUVs', url: '/used-cars/best-used-luxury-subcompact-suvs' },
    'Luxury Compact SUV':     { plural: 'Luxury Compact SUVs',    url: '/used-cars/best-used-luxury-compact-suvs' },
    'Luxury Midsize SUV':     { plural: 'Luxury Midsize SUVs',    url: '/used-cars/best-used-luxury-midsize-suvs' },
    'Luxury Full-Size SUV':   { plural: 'Luxury Full-Size SUVs',  url: '/used-cars/best-used-luxury-full-size-suvs' },
    'Luxury Small Car':       { plural: 'Luxury Small Cars',      url: '/used-cars/best-used-luxury-small-cars' },
    'Luxury Midsize Car':     { plural: 'Luxury Midsize Cars',    url: '/used-cars/best-used-luxury-midsize-cars' },
    'Luxury Full-Size Car':   { plural: 'Luxury Full-Size Cars',  url: '/used-cars/best-used-luxury-full-size-cars' },
    'Electric Vehicles':      { plural: 'Electric Vehicles',      url: '/used-cars/best-used-electric-vehicles' }
  };

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function slugify(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  // 'Compact SUVs' -> 'compact SUVs' (keep acronyms).
  function low(p) { return p.split(' ').map(function (w) { return (w === w.toUpperCase() || w.indexOf('SUV') === 0) ? w : w.toLowerCase(); }).join(' '); }
  // 'RAV4' -> 'RAV4s', 'X5' -> 'X5s', 'S-Class' -> 'S-Classes', '3 Series' -> '3 Series',
  // 'Prius' -> 'Priuses', 'Model Y' -> 'Model Ys', 2-3 letter caps and a lone S ('IS', 'RX', 'Model S') -> 'IS models'.
  function plural(md) {
    var last = md.split(/[\s]/).pop();
    if (/series$/i.test(md)) return md;
    if (/^[A-Z]{2,3}$/.test(last) || last === 'S') return md + ' models';
    return /(s|x|z|ch|sh)$/.test(md) ? md + 'es' : md + 's';
  }
  function ocCount(oc, md) {
    if (!oc || !oc.m) return 0;
    if (oc.m[md]) return oc.m[md];
    var k = Object.keys(oc.m).filter(function (x) { return x.toLowerCase() === md.toLowerCase(); })[0];
    return k ? oc.m[k] : 0;
  }
  var MAX_SEG_MODELS = 24; // segments without a core roster list every model; skip the bar past this
  function track(name, params) { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {} }
  function getJSON(u) { return fetch(u, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }

  function feed() {
    try {
      var raw = sessionStorage.getItem(FEED_CACHE_KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.records && Date.now() - p.timestamp < FEED_TTL) return Promise.resolve(p.records); }
    } catch (e) {}
    return getJSON(BASE).then(function (recs) {
      try { sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), records: recs })); } catch (e) {}
      return recs;
    });
  }

  // /used/2024-toyota-rav4-xle-premium-031842 -> {year, key, trim:'xle premium', vin6}; longest roster-key match.
  function parse(path, models) {
    var mm = /^\/used\/(20\d\d)-([a-z0-9-]+)-([a-z0-9]{6})\/?$/i.exec(path);
    if (!mm) return null;
    var rest = mm[2].toLowerCase();
    var keys = Object.keys(models).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (rest === k || rest.indexOf(k + '-') === 0) {
        return { year: +mm[1], key: k, trim: rest.slice(k.length + 1).replace(/-/g, ' '), vin6: mm[3].toLowerCase() };
      }
    }
    return null;
  }

  // Display trim: borrow the feed's casing when a live car has the same trim; else title-case, short tokens upper.
  function trimLabel(trim, cars) {
    if (!trim) return '';
    for (var i = 0; i < cars.length; i++) if (slugify(cars[i].tr) === slugify(trim)) return cars[i].tr;
    return trim.split(' ').map(function (w) { return w.length <= 3 && !/^(and|the|for|awd|fwd|rwd)$/.test(w) ? w.toUpperCase() : w.toUpperCase() === w ? w : w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }

  // Closest three: same trim, same powertrain (hybrid or not), nearest year, 15+ photos, newest arrival, newest photos.
  function pick(cars, year, trim) {
    var hyb = /\bhybrid\b/.test(trim), t = slugify(trim.replace(/\bhybrid\b/, ''));
    function key(x) {
      return [slugify(x.tr) === t ? 1 : 0, (/hybrid/i.test(x.t || '') === hyb) ? 1 : 0, -Math.abs((x.y || 0) - year),
              (x.pho || 0) >= 15 ? 1 : 0, x.fs || '', x.pm || ''];
    }
    return cars.map(function (x) { return { x: x, k: key(x) }; }).sort(function (a, b) {
      for (var i = 0; i < a.k.length; i++) { if (a.k[i] > b.k[i]) return -1; if (a.k[i] < b.k[i]) return 1; }
      return 0;
    }).slice(0, 3).map(function (o) { return o.x; });
  }

  function card(x, i) {
    var name = x.y + ' ' + x.mk + ' ' + (x.md || '').trim() + (/hybrid/i.test(x.t || '') && !/hybrid/i.test(x.md || '') ? ' Hybrid' : '');
    var sub = [x.tr, x.mi != null ? fmt(x.mi) + ' miles' : ''].filter(Boolean).join(' · ');
    return '<a class="b4-card" href="/used/' + esc(x.slug) + '" data-b4="card" data-pos="' + (i + 1) + '" data-vin6="' + esc((x.slug || '').slice(-6)) + '">' +
      (x.img ? '<img src="' + esc(x.img) + '" alt="' + esc(name) + '" loading="lazy" decoding="async">' : '<span class="b4-noimg"></span>') +
      '<span class="b4-cb"><span class="b4-ch">' + esc(name) + '</span><span class="b4-cs">' + esc(sub) + '</span>' +
      (x.p ? '<span class="b4-cp">$' + fmt(x.p) + '</span>' : '') +
      '<span class="b4-cd">' + esc([x.dn, x.dc].filter(Boolean).join(' · ')) + '</span></span></a>';
  }

  function dual(nIn, nTot, subIn, subOut) {
    var w = 100 * nIn / nTot;
    return '<div class="b4-dual"><div class="b4-dbar"><span class="b4-din" style="width:' + Math.max(w, 2).toFixed(1) + '%"></span></div>' +
      '<div class="b4-dlab" style="grid-template-columns:max(' + w.toFixed(1) + '%,120px) 1fr">' +
      '<div class="b4-dl b4-in"><b>Bestest</b><span>' + subIn + '</span></div>' +
      '<div class="b4-dl b4-out"><b>Not Bestest</b><span>' + subOut + '</span></div></div></div>';
  }

  var CSS =
    '.b4{font-family:Montserrat,-apple-system,BlinkMacSystemFont,sans-serif;color:#1a1a1a;max-width:980px;margin:0 auto;padding:28px 0 64px;text-align:left}' +
    '.b4 a{text-decoration:none}.b4 p,.b4 h1,.b4 h2,.b4 a,.b4 span,.b4 b{font-family:Montserrat,-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:normal}' + // site p = Lora
    '.b4-sold{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a877e;background:#f3f1ea;border-radius:6px;padding:4px 9px;margin:0 0 12px}' +
    '.b4 h1.b4-h1{font-family:Montserrat,sans-serif;font-size:32px;line-height:1.2;font-weight:700;margin:0 0 14px;max-width:860px;color:#1a1a1a}' +
    '.b4-lead{font-size:20px;font-weight:600;margin:0 0 14px;color:#333}' +
    '.b4-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:0 0 16px}' +
    '.b4-card{display:block;color:inherit;border:.5px solid #e7e5dd;border-radius:14px;overflow:hidden;background:#fff;transition:box-shadow .15s}.b4-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08)}' +
    '.b4-card img,.b4-noimg{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#f3f1ea}' +
    '.b4-cb{display:block;padding:14px 16px 16px}.b4-ch{display:block;font-weight:700;font-size:17px;line-height:1.25}' +
    '.b4-cs{display:block;color:#6b7280;font-size:13.5px;margin:4px 0 8px}.b4-cp{display:block;font-size:22px;font-weight:700;color:#1a6f4a}.b4-cd{display:block;font-size:13px;color:#444;margin-top:4px}' +
    '.b4-more{text-align:right;margin:0 0 36px}.b4-more.b4-r{margin:4px 0 0}' +
    '.b4-btn{display:inline-flex;padding:13px 20px;border-radius:10px;background:#1a6f4a;color:#fff!important;font-weight:600;font-size:15px}' +
    '.b4-btn.b4-ghost{background:#fff;color:#1a6f4a!important;border:1px solid #1a6f4a;margin-top:6px}' +
    '.b4-diff{margin:0 0 28px;padding:26px 0 0;border-top:.5px solid #e7e5dd}' +
    '.b4 h2.b4-nl{font-family:Montserrat,sans-serif;font-size:30px;line-height:1.2;font-weight:700;color:#1a1a1a;margin:0 0 10px}' +
    '.b4-desc{font-size:16.5px;line-height:1.6;color:#333;margin:0 0 22px;max-width:860px}.b4-how{color:#1a6f4a!important;font-size:12.5px;font-weight:600;margin-left:4px;white-space:nowrap}' +
    '.b4-only{font-size:16px;font-weight:600;margin:0 0 4px;color:#1a1a1a}' +
    '.b4-seg{padding:10px 0 0}' +
    '.b4-dual{margin:14px 0 8px}.b4-dbar{display:flex;height:34px;border-radius:8px;background:#e9e7e1;overflow:hidden}.b4-din{display:block;height:100%;background:#1a6f4a}' +
    '.b4-dlab{display:grid;gap:16px;margin-top:10px}.b4-dl b{display:block;font-size:18px;font-weight:700}.b4-in b{color:#1a6f4a}.b4-out{text-align:right}.b4-out b{color:#6f6d64}' +
    '.b4-dl>span{display:flex;flex-direction:column;gap:3px;font-size:13.5px;color:#555;margin-top:3px}.b4-out>span{align-items:flex-end}' +
    '.b4-dl a{color:#1a1a1a;font-weight:500}.b4-out a{color:#8a877e}.b4-dl a:hover{text-decoration:underline}' +
    '@media(max-width:720px){.b4{padding:20px 0 40px}.b4 h1.b4-h1{font-size:24px}.b4-lead{font-size:18px}.b4 h2.b4-nl{font-size:24px}' +
    '.b4-cards{grid-template-columns:1fr;gap:10px}.b4-card{display:grid;grid-template-columns:120px 1fr}.b4-card img,.b4-noimg{height:100%;aspect-ratio:auto}' +
    '.b4-cb{padding:10px 12px}.b4-ch{font-size:15px}.b4-cs{font-size:12.5px;margin:2px 0 4px}.b4-cp{font-size:18px}.b4-cd{font-size:12px}' +
    '.b4-btn{width:100%;justify-content:center;text-align:center}.b4-more{text-align:center}.b4-dl b{font-size:16px}.b4-dl>span{font-size:12.5px}}';

  function render(d) {
    var r = d.r, seg = SEGMENTS[r.seg] || { plural: r.seg ? r.seg + 's' : 'Cars', url: '/used-cars' };
    var segLow = low(seg.plural), md = r.md, mk = r.mk;
    var same = d.feed.filter(function (x) { return x.mk === mk && (x.md || '').trim() === md && x.p; });
    var segCars = d.feed.filter(function (x) { return x.sg === r.seg; });
    var scope = same.length ? 'model' : (segCars.length ? 'segment' : 'none');
    var cars = pick(same.length ? same : segCars.filter(function (x) { return x.p; }), d.p.year, d.p.trim);
    var name = d.p.year + ' ' + mk + ' ' + md + (d.p.trim ? ' ' + trimLabel(d.p.trim, same) : '');

    var html = '<p class="b4-sold">Sold</p>' +
      '<h1 class="b4-h1">That ' + esc(name) + ' was one of the best ' + esc(plural(md)) + ' for sale in Orange County</h1>';
    if (cars.length) {
      html += '<p class="b4-lead">' + (scope === 'model' ? (cars.length === 1 ? 'But here\u2019s another!' : 'But here are the others!') : 'But here are other Bestest ' + esc(segLow) + '!') + '</p>' +
        '<div class="b4-cards">' + cars.map(card).join('') + '</div>' +
        '<div class="b4-more">' + (scope === 'model'
          ? '<a class="b4-btn" data-b4="see_all" href="/used-cars?make=' + encodeURIComponent(mk) + '&model=' + encodeURIComponent(md) + '">See all Bestest ' + esc(plural(md)) + ' →</a>'
          : '<a class="b4-btn" data-b4="browse" href="' + esc(seg.url) + '">See all Bestest ' + esc(segLow) + ' →</a>') + '</div>';
    }

    var tot = d.oc && d.oc.total, live = d.feed.length;
    var totTxt = tot ? fmt(Math.floor(tot / 1000) * 1000) : '20,000';
    var liveTxt = live >= 100 ? fmt(Math.round(live / 100) * 100) : '1,200';
    html += '<section class="b4-diff"><h2 class="b4-nl">Bestest isn’t like other used-car listing sites.</h2>' +
      '<p class="b4-desc">There are more than ' + totTxt + ' used cars for sale in Orange County, but we only allow the best ' + liveTxt +
      ' or so. Founded by the former head of vehicle reviews and ratings at Kelley Blue Book, Bestest filters out older and problematic models, high-mileage clutter, and second-tier dealers, to bring you only the cars we’d recommend to friends and family. (For anything else, see CarGurus.) ' +
      '<a class="b4-how" data-b4="how" href="/methodology">How we pick →</a></p>';

    var ocN = ocCount(d.oc, md), n = same.length;
    function listings(k) { return fmt(k) + ' ' + esc(md) + (k === 1 ? ' listing' : ' listings'); }
    if (ocN && n && n * 2 <= ocN) {                 // "Only" needs Bestest at half the market or less
      html += '<p class="b4-only">Only ' + fmt(n) + ' of the ' + fmt(ocN) + ' used ' + esc(mk + ' ' + plural(md)) + ' for sale in Orange County ' + (n === 1 ? 'qualifies' : 'qualify') + ' as Bestest</p>' +
        dual(n, ocN, listings(n), listings(ocN - n));
    }
    html += '</section>';

    // Segment bar: the core roster when the segment has one, else every in/out model in the segment.
    var all = Object.keys(d.models).map(function (k) { return d.models[k]; }).filter(function (v) { return v.seg === r.seg && (v.s === 'A' || v.s === 'B'); });
    var core = all.filter(function (v) { return v.c; });
    var set = core.length ? core.concat(core.indexOf(r) < 0 && r.s === 'A' ? [r] : []) : all;
    var ins = set.filter(function (v) { return v.s === 'A'; }).sort(function (a, b) { return (a !== r) - (b !== r) || (a.mk + a.md).localeCompare(b.mk + b.md); });
    var outs = set.filter(function (v) { return v.s === 'B'; }).sort(function (a, b) { return (a.mk + a.md).localeCompare(b.mk + b.md); });
    if (ins.length && outs.length && (core.length || ins.length + outs.length <= MAX_SEG_MODELS)) {
      var aIn = ins.map(function (v) { return '<a data-b4="model" data-on="yes" data-m="' + esc(v.mk + ' ' + v.md) + '" href="/used-cars?make=' + encodeURIComponent(v.mk) + '&model=' + encodeURIComponent(v.md) + '">' + esc(v.mk + ' ' + v.md) + '</a>'; }).join('');
      var aOut = outs.map(function (v) { return '<a data-b4="model" data-on="no" data-m="' + esc(v.mk + ' ' + v.md) + '" href="' + esc(v.p || '/not-bestest?make=' + encodeURIComponent(v.mk) + '&model=' + encodeURIComponent(v.md)) + '">' + esc(v.mk + ' ' + v.md) + '</a>'; }).join('');
      html += '<section class="b4-seg"><p class="b4-only">Only ' + ins.length + ' of the ' + (ins.length + outs.length) + ' ' + esc(segLow) + ' qualify as Bestest</p>' +
        dual(ins.length, ins.length + outs.length, aIn, aOut) +
        (segCars.length ? '<div class="b4-more b4-r"><a class="b4-btn b4-ghost" data-b4="browse" href="' + esc(seg.url) + '">Browse all ' + fmt(segCars.length) + ' ' + esc(segLow) + ' on Bestest →</a></div>' : '') +
        '</section>';
    }

    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    MOUNT.innerHTML = '<div class="b4">' + html + '</div>';
    document.title = 'This ' + name + ' sold • Bestest';

    var base = { vehicle_make: mk, vehicle_model: md, segment: seg.plural, source_page: 'sold_404' };
    track('sold_404_view', Object.assign({ cars_shown: cars.length, card_scope: cars.length ? scope : 'none' }, base));
    MOUNT.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-b4]');
      if (!a) return;
      var kind = a.getAttribute('data-b4');
      if (kind === 'card') track('similar_from_404', Object.assign({ position: +a.getAttribute('data-pos'), vin6: a.getAttribute('data-vin6'), card_scope: scope }, base));
      else if (kind === 'see_all') track('sold_404_see_all', base);
      else if (kind === 'model') track('sold_404_model_click', Object.assign({ clicked_model: a.getAttribute('data-m'), on_bestest: a.getAttribute('data-on') }, base));
      else if (kind === 'browse') track('sold_404_browse', base);
      else if (kind === 'how') track('sold_404_how', base);
    });
  }

  // The embed hides the generic markup on /used/ URLs (html.bst-404-wait) until this decides.
  function showGeneric() { document.documentElement.classList.remove('bst-404-wait'); }
  if (!/^\/used\/./.test(location.pathname)) return showGeneric(); // generic 404: keep the shipped markup
  Promise.all([
    getJSON(BASE + '?roster'),
    feed(),
    getJSON(BASE + '?oc').catch(function () { return null; })
  ]).then(function (res) {
    var models = (res[0] && res[0].models) || {};
    var p = parse(location.pathname, models);
    if (!p) return showGeneric();                     // unknown model: generic 404 stays
    var r = models[p.key];
    if (!r || r.s !== 'A') return showGeneric();      // only Bestest models were ever listed
    render({ p: p, r: r, models: models, feed: Array.isArray(res[1]) ? res[1] : [], oc: res[2] });
  }).catch(showGeneric).then(showGeneric);            // render() replaced the markup, or the generic stays
})();
