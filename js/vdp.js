/* Bestest VDP script (pattern B). Moved out of the VDP template embeds on 2026-10-24:
   crumb, photo slider, Part A markup, Part B v12.1 and the slug fixup.
   Original code: js/vdp.original.js. Phase 1 changes, nothing else:
   - runs on DOMContentLoaded instead of window load
   - slider photos go through Cloudinary (w_1200), first slide eager, raw URL on error
   - lucide pinned to an exact version
   - reads the #bst-vdp-data JSON block when present, else today's data divs
   - builds the similar-cars + brand markup when the Part A embed is gone
   Skips itself while the old inline Part B is still on the page (no double run).
   Phase 3 (10/24), every VDP: rail est. mi/yr on the Jan 1 basis (miles_basis.py), slide 1
   fetchpriority=high, html.bst-vdp-ready once built (vdp.css layout-shift guards).
   Phase 3, test slugs only: the mock v13 modules from the vdp/1 block (see "Pattern B modules"). */
(function () {
  if (window.__bstVdp) return;
  window.__bstVdp = true;
  var inlineStillThere = [].some.call(document.scripts, function (s) {
    return !s.src && s.text.indexOf('function buildRightRail') > -1;
  });
  if (inlineStillThere && !window.BS_VDP_FORCE) return;

  var LUCIDE_URL = 'https://cdn.jsdelivr.net/npm/lucide@1.61.0/dist/umd/lucide.min.js';
  var CLD = 'https://res.cloudinary.com/dkhd5molz/image/fetch/';
  var SLIDE_TX = 'w_1200,c_limit,f_auto,q_auto';

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function cld(url, tx) {
    if (!url || url.indexOf(CLD) === 0) return url;
    return CLD + tx + '/' + url;
  }

  /* ── Data block (vdp/1): <script type="application/json" id="bst-vdp-data"> ── */
  var _blk;
  function readBlock() {
    if (_blk !== undefined) return _blk;
    _blk = null;
    var el = document.getElementById('bst-vdp-data');
    if (!el) return _blk;
    var raw = el.textContent || '';
    try { _blk = JSON.parse(raw); }
    catch (e) {
      // a bound field may arrive entity-escaped; decode once and retry
      try { var t = document.createElement('textarea'); t.innerHTML = raw; _blk = JSON.parse(t.value); }
      catch (e2) { _blk = null; }
    }
    if (_blk && _blk.schema !== 'vdp/1') _blk = null;
    return _blk;
  }
  function blockToData(b) {
    var l = b.listing || {}, dl = b.dealer || {};
    return {
      vin: l.vin || '', model: l.model || '', make: l.make || '', year: String(l.year || ''),
      trim: l.trim || '', price: +l.price || 0, miles: +l.miles || 0,
      segment: l.segment || '', bodyType: l.body_type || '', drivetrain: l.drivetrain || '',
      powertrain: l.powertrain || '', engine: l.engine || '', fuelType: l.fuel_type || '',
      cityMpg: String(l.city_mpg || ''), hwyMpg: String(l.hwy_mpg || ''), seating: String(l.seating || ''),
      extColor: l.ext_color || '', intColor: l.int_color || '', transmission: l.transmission || '',
      dealerName: dl.name || '', dealerCity: dl.city || '',
      dealerLat: dl.lat != null ? String(dl.lat) : '', dealerLng: dl.lng != null ? String(dl.lng) : '',
      dealerPhone: dl.phone || '', dealerEmail: dl.email || '', stockNo: l.stock_no || '',
      isCertified: l.certified ? 'true' : 'false', vdpUrl: l.dealer_vdp_url || '',
      heroImage: l.hero_image_url || '',
      variantModel: l.variant_model || '', variantTrim: l.variant_trim || '',
      milesPerYear: +l.miles_per_year || 0
    };
  }
  function getPhotos() {
    var b = readBlock();
    if (b && b.listing && b.listing.photos && b.listing.photos.length) return b.listing.photos.slice();
    var el = document.querySelector('.photo-links');
    var s = el ? el.textContent.trim() : '';
    return s ? s.split('|').map(function(u) { return u.trim(); }).filter(Boolean) : [];
  }

  /* ── Part A markup (similar-cars rails + brand module), built only if the embed is gone ── */
  var MARKUP = '<!-- Similar listings (styled output rails — populated by JS from hidden Collection Lists) -->\n' +
    '<div class="bst-similar-wrap" style="font-family:\'Montserrat\',sans-serif;max-width:1400px;margin:0 auto;padding:0 24px 64px;">\n' +
    '  <div class="bst-similar-row" id="bst-same-model-section" style="margin-bottom:3rem;display:none;">\n' +
    '    <div id="bst-same-model-heading" style="font-size:18px;font-weight:700;color:#111;margin-bottom:1rem;">More like this</div>\n' +
    '    <div id="bst-same-model-row" style="display:flex;gap:1rem;overflow-x:auto;padding-bottom:12px;scrollbar-width:none;"></div>\n' +
    '  </div>\n' +
    '  <div class="bst-similar-row" id="bst-same-segment-section" style="margin-bottom:3rem;display:none;">\n' +
    '    <div id="bst-same-segment-heading" style="font-size:18px;font-weight:700;color:#111;margin-bottom:1rem;">Similar vehicles in this segment</div>\n' +
    '    <div id="bst-same-segment-row" style="display:flex;gap:1rem;overflow-x:auto;padding-bottom:12px;scrollbar-width:none;"></div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '\n' +
    '<!-- Brand module -->\n' +
    '<div class="bst-brand-wrap" style="font-family:\'Montserrat\',sans-serif;max-width:1400px;margin:0 auto;padding:0 24px 64px;">\n' +
    '  <div style="background:#e8f4ea;border-radius:14px;padding:28px 32px;border:0.5px solid rgba(58,125,68,0.15);display:flex;align-items:center;justify-content:space-between;gap:2rem;flex-wrap:wrap;">\n' +
    '    <div>\n' +
    '      <div style="font-size:16px;font-weight:700;color:#1a3d1f;margin-bottom:6px;">New to Bestest?</div>\n' +
    '      <div style="font-size:14px;color:#3d5e41;line-height:1.65;max-width:600px;">Every listing here has been pre-vetted — no problem-prone models, no high-mileage clutter, no independent dealers. Founded by the former head of vehicle reviews &amp; ratings at Kelley Blue Book and Autotrader, Bestest is the only used-car shopping site that\'s already done the research for you.</div>\n' +
    '    </div>\n' +
    '    <a href="/about" style="background:#2d6235;color:#fff;font-family:\'Montserrat\',sans-serif;font-size:14px;font-weight:700;padding:12px 22px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;">How Bestest works →</a>\n' +
    '  </div>\n' +
    '</div>';
  function ensureMarkup() {
    if (document.querySelector('.bst-similar-wrap')) return;
    var anchor = document.querySelector('.bst-hidden-list');
    var box = document.createElement('div');
    box.innerHTML = MARKUP;
    var parent = anchor ? anchor.parentNode : document.querySelector('main') || document.body;
    while (box.firstChild) parent.insertBefore(box.firstChild, anchor || null);
  }

  /* === slug fixup (runs first: may redirect) === */
  (function() {
    var path = window.location.pathname.split('/').filter(Boolean);
    if (path.length < 2) return;
  
    var slugInUrl = path[path.length - 1];
    var prefix = path[path.length - 2];
  
    if (prefix !== 'used' && prefix !== 'active-listings') return;
  
    var isVin = /^[A-HJ-NPR-Z0-9]{17}$/i.test(slugInUrl);
    if (!isVin) return;
  
    var blk = readBlock();
    var dataEl = document.getElementById('bst-vin-data');
    if (!blk && !dataEl) return;
  
    var properSlug = blk ? (blk.listing || {}).slug : dataEl.dataset.vdpSlug;
    if (!properSlug || properSlug === slugInUrl) return;
  
    var newPath = '/used/' + properSlug + window.location.search + window.location.hash;
    window.location.replace(newPath);
  })();

  /* === breadcrumb: search-results back link === */
  (function () {
    var seg = document.getElementById('bst-crumb-seg');
    if (!seg) return;
  
    var ref = document.referrer;
    if (!ref) return;                                  // direct / Googlebot → keep "Midsize SUVs"
    var u; try { u = new URL(ref); } catch (e) { return; }
    if (u.origin !== window.location.origin) return;   // off-site → keep segment
  
    var path = u.pathname.replace(/\/$/, '');
    var fromSearch = path.indexOf('/used-cars') === 0 && u.search.length > 1;  // a /used-cars page WITH filters
    if (!fromSearch) return;                            // clean segment SRP or anything else → keep segment
  
    // Came from a parametered search → swap the segment crumb to "Search results"
    seg.querySelector('*') ? (seg.textContent = 'Search results') : (seg.textContent = 'Search results');
    seg.setAttribute('href', ref);                     // fallback if history is empty
    seg.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;  // let modified clicks open normally
      e.preventDefault();
      if (typeof gtag === 'function') gtag('event', 'back_link_click', { source: 'breadcrumb_search' });
      if (window.history.length > 1) window.history.back();   // return to exact scroll/filters
      else window.location.href = ref;
    });
  })();

  /* === photo slider === */
  onReady(function() {
    var sliderMask = document.querySelector('.slider-3 .w-slider-mask');
    if (!sliderMask) return;
    var urls = getPhotos();
    if (!urls.length) return;
    sliderMask.innerHTML = '';
    urls.forEach(function(url, i) {
      var slide = document.createElement('div');
      slide.className = 'slide-2 w-slide';
      var img = document.createElement('img');
      img.className = 'image-3';
      img.alt = 'Vehicle photo';
      img.loading = i === 0 ? 'eager' : 'lazy';
      if (i === 0) img.setAttribute('fetchpriority', 'high');
      img.src = cld(url, SLIDE_TX);
      img.onerror = function () { if (img.src !== url) { img.onerror = null; img.src = url; } };
      slide.appendChild(img);
      sliderMask.appendChild(slide);
    });
    window.Webflow && window.Webflow.require && window.Webflow.require('slider') && window.Webflow.require('slider').redraw();
  });

  /* === Part B v12.1: rail, CTA, below-fold, slim bar, GA4, similar cars === */
  (function () {
  
    /* ── Config ── */
    var MIN_RESULTS = 5;
    var SHOW_COUNT  = 5;
  
    /* ── Segment → SRP slug map (mirror of SRP embed's SEGMENT_TO_SLUG) ── */
    var SEGMENT_TO_SLUG = {
      'Compact Car':            '/used-cars/best-used-compact-cars',
      'Midsize/Full-size Car':  '/used-cars/best-used-midsize-cars',
      'Subcompact SUV':         '/used-cars/best-used-subcompact-suvs',
      'Compact SUV':            '/used-cars/best-used-compact-suvs',
      'Midsize SUV':            '/used-cars/best-used-midsize-suvs',
      'Full-Size SUV':          '/used-cars/best-used-full-size-suvs',
      'Compact/Midsize Truck':  '/used-cars/best-used-midsize-trucks',
      'Full-Size Truck':        '/used-cars/best-used-full-size-trucks',
      'Minivan':                '/used-cars/best-used-minivans',
      'Electric Vehicles':      '/used-cars/best-used-electric-vehicles',
      'Luxury Small Car':       '/used-cars/best-used-luxury-small-cars',
      'Luxury Midsize Car':     '/used-cars/best-used-luxury-midsize-cars',
      'Luxury Full-Size Car':   '/used-cars/best-used-luxury-full-size-cars',
      'Luxury Subcompact SUV':  '/used-cars/best-used-luxury-subcompact-suvs',
      'Luxury Compact SUV':     '/used-cars/best-used-luxury-compact-suvs',
      'Luxury Midsize SUV':     '/used-cars/best-used-luxury-midsize-suvs',
      'Luxury Full-Size SUV':   '/used-cars/best-used-luxury-full-size-suvs'
    };
  
    /* ── Helpers ── */
    function fmtPrice(n) { return n ? '$' + Math.round(n).toLocaleString('en-US') : ''; }
    function fmtMiles(n) { return n ? Math.round(n).toLocaleString('en-US') : ''; }
    /* Jan 1 of the model year to today, floored at a quarter year: the same basis as
       miles_basis.py (listing paragraph, vdp_render). The block carries the number itself. */
    function annualMilesRoundedUp(miles, year, fromBlock) {
      if (fromBlock) return Math.round(fromBlock).toLocaleString('en-US');
      if (!miles || !year) return null;
      var y = parseInt(year, 10);
      if (!y) return null;
      var age = Math.max((Date.now() - Date.UTC(y, 0, 1)) / (365.25 * 864e5), 0.25);
      return (Math.ceil((miles / age) / 100) * 100).toLocaleString('en-US');
    }
    function formatPhoneDisplay(phone) {
      var d = (phone || '').replace(/\D/g, '');
      if (d.length === 10) return '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6);
      return phone;
    }
    function formatPhoneTel(phone) {
      var d = (phone || '').replace(/\D/g, '');
      if (d.length === 10) return '+1' + d;
      if (d.length === 11) return '+' + d;
      return phone;
    }
    function escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function li(name) {
      return '<i data-lucide="' + name + '" style="width:22px;height:22px;stroke:#555;stroke-width:1.5;display:block;"></i>';
    }
  
    /* ── Dealer distance line (VDP) ──
       Reuses the user zip + zip->latlng localStorage that distance.js (the SRP
       module) maintains, so the VDP and SRP agree on location. If the cache is
       cold (visitor landed straight on a VDP), does its own one-time
       Zippopotamus fetch and writes back to the same cache key. */
    var BST_ZIP_KEY        = 'bst_user_zip';
    var BST_LATLNG_PREFIX  = 'bst_zip_latlng_';
    var BST_DEFAULT_ZIP    = '92868';
    var DIST_PIN_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  
    function distGetUserZip() {
      try {
        var p = new URLSearchParams(window.location.search).get('zip');
        if (p && /^\d{5}$/.test(p)) return p;
      } catch (e) {}
      try {
        var s = localStorage.getItem(BST_ZIP_KEY);
        if (s && /^\d{5}$/.test(s)) return s;
      } catch (e) {}
      return BST_DEFAULT_ZIP;
    }
  
    function distGetCachedLatLng(zip) {
      try {
        var raw = localStorage.getItem(BST_LATLNG_PREFIX + zip);
        if (!raw) return null;
        var parts = raw.split(',');
        var lat = parseFloat(parts[0]), lng = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat: lat, lng: lng };
      } catch (e) { return null; }
    }
  
    // Zip -> lat/lng from the feed Worker's GeoNames table; zippopotam.us (same data) only
    // when the Worker call fails. A Worker 404 means an unknown zip, so no fallback.
    function distFetchLatLng(zip) {
      var feedUrl = (typeof window.BS_FEED_URL === 'string' && window.BS_FEED_URL) || 'https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/';
      return fetch(feedUrl + '?zip=' + zip)
        .then(function (r) {
          if (r.status === 404) return null;
          if (!r.ok) throw new Error('feed ' + r.status);
          return r.json();
        })
        .then(function (data) {
          if (data && typeof data.lat !== 'number') throw new Error('feed: not a geo answer');
          return data ? { lat: data.lat, lng: data.lng } : null;
        })
        .catch(function () {
          return fetch('https://api.zippopotam.us/us/' + zip)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
              if (!data || !data.places || !data.places[0]) return null;
              var p = data.places[0];
              return { lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) };
            });
        })
        .then(function (ll) {
          if (!ll || isNaN(ll.lat) || isNaN(ll.lng)) return null;
          try { localStorage.setItem(BST_LATLNG_PREFIX + zip, ll.lat + ',' + ll.lng); } catch (e) {}
          return ll;
        })
        .catch(function () { return null; });
    }
  
    function haversineMiles(lat1, lng1, lat2, lng2) {
      var R = 3958.8, toRad = function (x) { return x * Math.PI / 180; };
      var dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
      var a = Math.sin(dLat/2)*Math.sin(dLat/2)
            + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)*Math.sin(dLng/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
  
    function fmtDist(mi) { return mi < 1.5 ? '1 mi away' : Math.round(mi) + ' mi away'; }
  
    function renderDistanceLine(d) {
      var el = document.getElementById('bst-dealer-distance');
      if (!el) return;
      if (!d.dealerCity) { el.style.display = 'none'; return; }
  
      var dLat = parseFloat(d.dealerLat), dLng = parseFloat(d.dealerLng);
  
      function paint(userLL) {
        var distTxt = '';
        if (userLL && !isNaN(dLat) && !isNaN(dLng)) {
          distTxt = ' · ' + fmtDist(haversineMiles(userLL.lat, userLL.lng, dLat, dLng));
        }
        el.innerHTML = DIST_PIN_SVG + '<span>' + escapeHtml(d.dealerCity) + distTxt + '</span>';
        el.style.display = '';
      }
  
      var zip = distGetUserZip();
      var cached = distGetCachedLatLng(zip);
      if (cached) { paint(cached); return; }
  
      paint(null); /* city only, immediately */
      distFetchLatLng(zip).then(function (userLL) {
        if (userLL) paint(userLL); /* upgrade with distance once resolved */
      });
    }
  
    /* ── SVG checkmark ── */
    var CHECK_CIRCLE_SVG = '<svg viewBox="0 0 20 20" width="18" height="18" style="flex-shrink:0;"><circle cx="10" cy="10" r="10" fill="#31B56B"/><path d="M5.6 10.3 l2.7 2.7 5.9 -6.3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var CHECK_SVG_SM = '<svg viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"/></svg>';
  
    function check(text) {
      return '<div style="font-size:13px;color:#333;display:flex;align-items:center;gap:7px;line-height:1.3;padding:1px 0;">'
        + CHECK_CIRCLE_SVG + text + '</div>';
    }
  
    function card(title, rows) {
      return '<div class="bst-card" style="border:1px solid #e8e8e8;border-radius:10px;padding:16px 18px;">'
        + '<div class="bst-card-h" style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:12px;">' + title + '</div>'
        + rows.map(function(r, i) {
            return '<div class="bst-card-row" style="display:flex;justify-content:space-between;padding:7px 0;'
              + (i < rows.length - 1 ? 'border-bottom:1px solid #f5f5f5;' : '')
              + 'font-size:13px;">'
              + '<span style="color:#6b7280;">' + r[0] + '</span>'
              + '<span style="color:#1a1a1a;font-weight:500;font-size:' + (r[0]==='VIN'?'11px':'13px') + ';">' + r[1] + '</span>'
              + '</div>';
          }).join('')
        + '</div>';
    }
  
    function iconCell(iconHTML, value) {
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 4px;">'
        + '<div style="width:52px;height:52px;border-radius:50%;background:#f5f5f3;display:flex;align-items:center;justify-content:center;">' + iconHTML + '</div>'
        + '<div style="font-size:12px;font-weight:600;color:#1a1a1a;text-align:center;line-height:1.3;">' + value + '</div>'
        + '</div>';
    }
  
    function specRow(label, value) {
      return '<div class="bst-spec-row">'
        + '<span class="bst-spec-row-label">' + escapeHtml(label) + '</span>'
        + '<span class="bst-spec-row-value">' + escapeHtml(value) + '</span>'
        + '</div>';
    }
  
    /* ── Custom SVGs ── */
    var engineSVG = '<svg viewBox="0 0 512 512" fill="#555" style="width:22px;height:22px;"><path d="M494.32,196.801l-4.858-8.131h-85.516v39.564h-8.557v-57.371h-44.32l-28.138-24.95h-46.53v-22.695h14.966V89.827H172.742v33.391h14.966v22.695h-48.443l-28.138,24.95H55.791v16.696v66.236h-22.4v-42.616H0v118.625h33.391v-42.617h22.4v66.236v16.696h83.474l58.709,52.054h197.414v-58.444h8.557v39.565h85.516l4.858-8.132c1.81-3.027,17.68-31.537,17.68-99.181S496.13,199.829,494.32,196.801z M221.101,123.22h21.909v22.695h-21.909V123.22z M468.927,369.902h-31.59v-39.565h-75.34v58.444H210.646l-58.709-52.054H89.183V204.255h34.617l28.138-24.95h158.32l28.138,24.95h23.601v57.371h75.34v-39.564h31.59c3.873,11.386,9.681,34.956,9.681,73.921C478.609,334.947,472.801,358.516,468.927,369.902z"/></svg>';
    var awdSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><rect x="4" y="2" width="3" height="5" rx="1"/><rect x="17" y="2" width="3" height="5" rx="1"/><rect x="4" y="17" width="3" height="5" rx="1"/><rect x="17" y="17" width="3" height="5" rx="1"/><line x1="7" y1="4.5" x2="17" y2="4.5"/><line x1="7" y1="19.5" x2="17" y2="19.5"/><line x1="12" y1="4.5" x2="12" y2="19.5"/></svg>';
  
    /* ── Get data ── */
    function getData() {
      var blk = readBlock();
      if (blk) return blockToData(blk);
      var el = document.getElementById('bst-vin-data');
      if (!el) return null;
      return {
        vin:          el.dataset.vin || '',
        model:        el.dataset.model || '',
        make:         el.dataset.make || '',
        year:         el.dataset.year || '',
        trim:         el.dataset.trim || '',
        price:        parseFloat(el.dataset.price) || 0,
        miles:        parseFloat(el.dataset.miles) || 0,
        segment:      el.dataset.segment || '',
        bodyType:     el.dataset.bodyType || '',
        drivetrain:   el.dataset.drivetrain || '',
        powertrain:   el.dataset.powertrain || '',
        engine:       el.dataset.engine || '',
        fuelType:     el.dataset.fuelType || '',
        cityMpg:      el.dataset.cityMpg || '',
        hwyMpg:       el.dataset.hwyMpg || '',
        seating:      el.dataset.seating || '',
        extColor:     el.dataset.extColor || '',
        intColor:     el.dataset.intColor || '',
        transmission: el.dataset.transmission || '',
        dealerName:   el.dataset.dealerName || '',
        dealerCity:   el.dataset.dealerCity || '',
        dealerLat:    el.dataset.dealerLat || '',
        dealerLng:    el.dataset.dealerLng || '',
        dealerPhone:  el.dataset.dealerPhone || '',
        dealerEmail:  el.dataset.dealerEmail || '',
        stockNo:      el.dataset.stockNo || '',
        isCertified:  el.dataset.isCertified || '',
        vdpUrl:       el.dataset.vdpUrl || '',
        heroImage:    el.dataset.heroImageUrl || '',
      };
    }
  
    function getBespokeParagraphs() {
      function read(sel) {
        var el = document.querySelector('.bst-hidden-data ' + sel);
        return el ? (el.textContent || '').trim() : '';
      }
      return {
        listing: read('.bst-listing-paragraph'),
        trim:    read('.bst-trim-paragraph'),
        model:   read('.bst-model-paragraph')
      };
    }
  
    function vehicleNoun(seg) {
      var s = (seg || '').toLowerCase();
      if (s.indexOf('pickup') > -1 || s.indexOf('truck') > -1) return 'pickup';
      if (s.indexOf('minivan') > -1 || s.indexOf('van') > -1)  return 'minivan';
      if (s.indexOf('suv') > -1 || s.indexOf('crossover') > -1) return 'SUV';
      return 'vehicle';
    }
    /* Real body type comes from the data div; this is a fallback from segment. */
    function inferBodyType(seg) {
      var s = (seg || '').toLowerCase();
      if (s.indexOf('truck') > -1 || s.indexOf('pickup') > -1) return 'Pickup';
      if (s.indexOf('suv') > -1 || s.indexOf('crossover') > -1) return 'SUV';
      if (s.indexOf('minivan') > -1 || s.indexOf('van') > -1) return 'Minivan';
      if (s.indexOf('car') > -1 || s.indexOf('sedan') > -1) return 'Sedan';
      return '';
    }
    /* Expand short powertrain codes to display labels */
    function powertrainLabel(pt) {
      var map = {
        'BEV':  'Electric',
        'HEV':  'Hybrid',
        'PHEV': 'Plug-in Hybrid',
        'MHEV': 'Mild Hybrid',
        'Combustion': 'Combustion'
      };
      return map[pt] || pt || '';
    }
  
    /* ── Right rail ── */
  function buildRightRail(d) {
    var rail = document.querySelector('.div-block-3');
    if (!rail) return;
  
    var isCPO    = d.isCertified === 'true';
    var milesStr = fmtMiles(d.miles);
    var annMiles = annualMilesRoundedUp(d.miles, d.year, d.milesPerYear);
    var milesLine = milesStr
      ? milesStr + ' miles' + (annMiles ? ' &nbsp;·&nbsp; est. ' + annMiles + ' mi/yr' : '')
      : '';
    var phoneDisplay = formatPhoneDisplay(d.dealerPhone);
    var phoneTel     = formatPhoneTel(d.dealerPhone);
    var vdpUrlSafe   = escapeHtml(d.vdpUrl || '#');
  
    var segmentHTML = '';
    if (d.segment) {
      var segSlug = SEGMENT_TO_SLUG[d.segment];
      segmentHTML = segSlug
        ? '<a class="bst-segment-link" href="' + escapeHtml(segSlug) + '" data-bst-track="segment_link" data-bst-vin="' + escapeHtml(d.vin) + '">' + escapeHtml(d.segment) + '</a>'
        : '<span style="font-size:13px;color:#6b7280;">' + escapeHtml(d.segment) + '</span>';
    }
  
    rail.style.cssText = 'display:flex;flex-direction:column;gap:22px;justify-content:flex-start;';
  
    /* TOP slot: segment + trust checks (between native H1 and native price) */
    var top = document.getElementById('bst-rail-top');
    if (top) {
      top.innerHTML = [
        segmentHTML ? '<div style="margin-top:-16px;margin-bottom:14px;">' + segmentHTML + '</div>' : '',
        '<div style="display:flex;flex-direction:column;gap:0;">',
          isCPO ? check(d.make + '-certified pre-owned') : '',
          check('Recommended model'),
          check('Approved dealer'),
          check('Qualified listing'),
        '</div>',
      ].join('');
    }
  
    /* BOTTOM slot: miles + CTA + distance (after native price) */
    var bottom = document.getElementById('bst-rail-bottom');
    if (bottom) {
      bottom.innerHTML = [
        milesLine ? '<div style="font-size:13px;color:#6b7280;margin-top:-16px;margin-bottom:8px;">' + milesLine + '</div>' : '',
        '<div class="bst-cta-frame" id="bst-main-cta-frame">',
          '<p class="bcf-dealer-line">',
            '<span class="bcf-dealer-name">' + escapeHtml(d.dealerName) + '</span>',
            '<span class="bcf-dot">•</span>',
            '<span class="bcf-approval">A Bestest-approved dealer</span>',
          '</p>',
          '<a class="bcf-button" id="bst-main-cta" data-bst-track="main_cta" data-bst-vin="' + escapeHtml(d.vin) + '" data-bst-dealer="' + escapeHtml(d.dealerName) + '" href="' + vdpUrlSafe + '" target="_blank" rel="noopener">Check availability →</a>',
            (function(){
            if (!d.dealerPhone && !d.dealerEmail) return '';
            var subjectLine = 'Inquiry: ' + [d.year, d.make, d.model, d.trim].filter(Boolean).join(' ');
            if (d.vin) subjectLine += ' (VIN ' + d.vin + ')';
            var bodyLine = "I'm interested in this vehicle and would like to know if it's still available.\n\nI saw it on Bestest: " + window.location.href;
            var mailto = 'mailto:' + encodeURIComponent(d.dealerEmail)
                       + '?subject=' + encodeURIComponent(subjectLine)
                       + '&body=' + encodeURIComponent(bodyLine);
            var phoneHTML = d.dealerPhone ? (
              '<a class="bcf-phone" id="bst-phone-chip" data-bst-track="phone_chip" data-bst-vin="' + escapeHtml(d.vin) + '" data-bst-dealer="' + escapeHtml(d.dealerName) + '" href="tel:' + escapeHtml(phoneTel) + '">'
              + '<svg class="bcf-phone-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a7a42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
              + '<span class="bcf-phone-label">Call</span>'
              + '<span class="bcf-phone-num">' + escapeHtml(phoneDisplay) + '</span></a>'
            ) : '';
            var emailHTML = d.dealerEmail ? (
              '<a class="bcf-email" id="bst-email-chip" data-bst-track="email_chip" data-bst-vin="' + escapeHtml(d.vin) + '" data-bst-dealer="' + escapeHtml(d.dealerName) + '" href="' + mailto + '">'
              + '<svg class="bcf-email-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a7a42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
              + '<span class="bcf-email-label">Email</span>'
              + '<span class="bcf-email-text">Send a note</span></a>'
            ) : '';
            return '<div class="bcf-phone-wrap">' + phoneHTML + emailHTML + '</div>';
          })(),
        '</div>',
        '<div id="bst-dealer-distance" class="bst-vdp-distance" style="display:none;"></div>',
      ].join('');
    }
  }
    /* ── About Bestest block ──
       Copy lives in template literals (backticks) so it's easy to edit.
       To change a line, just edit the prose between the backticks. */
    function buildAboutBlock(d) {
      var bespoke = getBespokeParagraphs();
      var hasAllBespoke = !!(bespoke.listing && bespoke.trim && bespoke.model);
  
      var founderHTML = `<div class="bst-about-founder">Bestest was founded by the former head of vehicle reviews and ratings at Kelley Blue Book and Autotrader, who's helped millions of shoppers choose the right car — and avoid the bad ones.</div>`;
  
      if (hasAllBespoke) {
        var trimHeading  = d.trim ? `About the ${d.trim} trim` : 'About this trim';
        var ymm = [d.year, d.make, d.model].filter(Boolean).join(' ');
        var modelHeading = ymm ? `About the ${ymm}` : 'About this model';
  
        var blocksHTML = [
          ['About this listing', bespoke.listing],
          [trimHeading,           bespoke.trim],
          [modelHeading,          bespoke.model]
        ].map(function(b) {
          return `<div>
            <div class="bst-about-bespoke-h"><span class="bst-about-bespoke-check"></span>${escapeHtml(b[0])}</div>
            <p class="bst-about-bespoke-p">${escapeHtml(b[1])}</p>
          </div>`;
        }).join('');
  
        return `<div id="bst-about-block">
          <div class="bst-about-h1">This car isn't just good, it's Bestest.</div>
          <div class="bst-about-h2">It passed all our tests to get here.</div>
          <div class="bst-about-bespoke-blocks">${blocksHTML}</div>
          ${founderHTML}
        </div>`;
      }
  
      var noun = vehicleNoun(d.segment);
      var ymm  = [d.year, d.make, d.model].filter(Boolean).join(' ');
  
      var bullets = [
        {
          label: 'Recommended model',
          body: `The ${ymm} is a reliable, respected, well-reviewed ${noun} — the only kind you'll find on Bestest. Our banned list is more than 50 models long, in fact, because there's no such thing as a <strong class="bst-about-gd">Great Deal!</strong> on a used car any expert would tell you to avoid altogether.`
        },
        {
          label: 'Approved dealer',
          body: `Every Bestest listing comes from an established, reputable, factory-authorized dealership in Orange County, with most providing free vehicle history reports. No corner lots. No private sellers. Just dealers with more to gain by treating you right.`
        },
        {
          label: 'Qualified listing',
          body: `Three to five years old is the sweet spot for used cars, so we don't even list anything with more than five years or 50,000 miles on the clock. If it's on Bestest, it's a car we'd let our friends buy.`
        }
      ];
  
      var bulletsHTML = bullets.map(function(b) {
        return `<div class="bst-about-bullet">
          <div class="bst-about-bullet-check">${CHECK_CIRCLE_SVG}</div>
          <div class="bst-about-bullet-text"><strong>${b.label}</strong>&nbsp;${b.body}</div>
        </div>`;
      }).join('');
  
      return `<div id="bst-about-block">
        <div class="bst-about-h1">This car isn't just good, it's Bestest.</div>
        <div class="bst-about-h2">We've already done the research on this one.</div>
        <div class="bst-about-bullets">${bulletsHTML}</div>
        ${founderHTML}
      </div>`;
    }
  
    /* ── Below fold ── */
    function buildBelowFold(d) {
      var existing = document.getElementById('bst-below-fold');
      if (existing) existing.remove();
  
      var milesStr  = fmtMiles(d.miles);
      var driveLabel = {FWD:'Front-wheel drive',AWD:'All-wheel drive','4WD':'All-wheel drive',RWD:'Rear-wheel drive'}[d.drivetrain] || d.drivetrain;
      var driveShort = {FWD:'FWD',AWD:'AWD','4WD':'4WD',RWD:'RWD'}[d.drivetrain] || d.drivetrain;
      var mpgLabel  = d.cityMpg && d.hwyMpg ? d.cityMpg + ' / ' + d.hwyMpg + ' mpg' : '';
      var ptLabel   = powertrainLabel(d.powertrain);
      var isElectric = d.powertrain === 'BEV';
  
      var identityRows = [['Make',d.make],['Model',d.variantModel || d.model],['Year',d.year],['Trim',d.trim],['Condition','Used']].filter(function(r){return r[1];});
      var engineRows   = [
        ['Engine', d.engine],
        ['Fuel type', d.fuelType],
        ['City MPG', d.cityMpg],
        ['Hwy MPG', d.hwyMpg],
        ['Powertrain', ptLabel]
      ].filter(function(r){return r[1];});
      var bodyRows     = [['Body type', d.bodyType || inferBodyType(d.segment)],['Drivetrain',d.drivetrain],['Transmission',d.transmission],['Seating',d.seating?d.seating+' passengers':'']].filter(function(r){return r[1];});
      var colorRows    = [['Exterior',d.extColor],['Interior',d.intColor],['Mileage',milesStr?milesStr+' mi':''],['VIN',d.vin],['Stock no.',d.stockNo]].filter(function(r){return r[1];});
  
      var mobileMpgLabel = isElectric ? 'MPGe' : 'MPG';
      var mobileSpecRows = [
        d.extColor ? specRow('Exterior', d.extColor) : '',
        d.intColor ? specRow('Interior', d.intColor) : '',
        driveShort ? specRow('Drive', driveShort) : '',
        d.engine ? specRow('Engine', d.engine) : '',
        mpgLabel ? specRow(mobileMpgLabel, d.cityMpg + ' / ' + d.hwyMpg) : '',
        d.transmission ? specRow('Trans.', d.transmission) : ''
      ].filter(Boolean).join('');
  
      var iconCells = [];
      if (d.extColor)       iconCells.push(iconCell(li('Paintbrush'), d.extColor + ' exterior'));
      if (d.intColor)       iconCells.push(iconCell(li('SwatchBook'), d.intColor + ' interior'));
      if (driveLabel)       iconCells.push(iconCell(awdSVG, driveLabel));
      if (d.engine)         iconCells.push(iconCell(engineSVG, d.engine));
      if (mpgLabel) {
        var fuelIcon = isElectric ? li('Zap') : li('Fuel');
        var fuelText = isElectric ? d.cityMpg + ' / ' + d.hwyMpg + ' MPGe' : mpgLabel;
        iconCells.push(iconCell(fuelIcon, fuelText));
      }
      if (d.transmission)   iconCells.push(iconCell(li('Cog'), d.transmission));
      var iconCols = Math.max(iconCells.length, 1);
  
      var bf = document.createElement('div');
      bf.id = 'bst-below-fold';
      bf.style.cssText = 'font-family:Montserrat,sans-serif;max-width:1400px;margin:0 auto;padding:0 24px;';
  
      var greenBlock = buildAboutBlock(d);
  
      bf.innerHTML = [
        '<div class="bst-spec-icons" style="padding:20px 0;">',
          '<div style="display:grid;grid-template-columns:repeat(' + iconCols + ',1fr);gap:4px;">',
            iconCells.join(''),
          '</div>',
        '</div>',
        '<div class="bst-spec-rows" style="padding:14px 0;">',
          '<div class="bst-spec-rows-grid">' + mobileSpecRows + '</div>',
        '</div>',
        '<div style="padding:8px 0 0;">',
          greenBlock,
        '</div>',
        '<div style="padding:36px 0 0;">',
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">',
            card('Vehicle identity', identityRows),
            card('Engine &amp; performance', engineRows),
            card('Body &amp; configuration', bodyRows),
            card('Colors &amp; listing info', colorRows),
          '</div>',
        '</div>',
        '<div style="padding-bottom:48px;"></div>',
      ].join('');
  
      var simWrap = document.querySelector('.bst-similar-wrap');
      if (simWrap) simWrap.parentNode.insertBefore(bf, simWrap);
    }
  
    /* ── Slim sticky bar ── */
    function mountSlimBar(d) {
      var existing = document.getElementById('bst-slim-bar');
      if (existing) existing.remove();
      var milesStr   = fmtMiles(d.miles);
      var priceStr   = fmtPrice(d.price);
      var titleText  = [d.year, d.make, d.model, d.trim].filter(Boolean).join(' ');
      var vdpUrlSafe = escapeHtml(d.vdpUrl || '#');
      // 88x64 thumb: ask Cloudinary for 2x instead of the 640px hero (it was competing with the LCP image)
      var thumbUrl   = (d.heroImage || '').replace('/w_640,c_fill,', '/w_176,h_128,c_fill,');

      var bar = document.createElement('div');
      bar.id = 'bst-slim-bar';
      bar.innerHTML = [
        (thumbUrl ? '<img src="' + escapeHtml(thumbUrl) + '" alt="" width="88" height="64" fetchpriority="low" decoding="async">' : ''),
        '<div class="bsb-text">',
          '<div class="bsb-title">' + escapeHtml(titleText) + '</div>',
          '<div class="bsb-meta">' + escapeHtml(d.dealerName) + ' · ' + escapeHtml(milesStr) + ' miles</div>',
        '</div>',
        '<div class="bsb-actions">',
          '<div class="bsb-price">' + priceStr + '</div>',
          '<a class="bsb-cta" id="bst-slim-cta" data-bst-track="slim_cta" data-bst-vin="' + escapeHtml(d.vin) + '" data-bst-dealer="' + escapeHtml(d.dealerName) + '" href="' + vdpUrlSafe + '" target="_blank" rel="noopener">Check availability →</a>',
        '</div>',
      ].join('');
      document.body.appendChild(bar);
  
      var mainCta = document.getElementById('bst-main-cta-frame');
      if (!mainCta) return;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var ctaIsAboveViewport = entry.boundingClientRect.bottom < 0;
          bar.classList.toggle('bsb-visible', ctaIsAboveViewport);
        });
      }, { threshold: 0, rootMargin: '0px' });
      observer.observe(mainCta);
    }
  
    /* ── GA4 ──
       Fires a tagged view_vdp pageview on load, then one event per dealer-bound
       click. Every event carries vehicle context (make, model, year, segment,
       trim, dealer, price) from the data div via vp, so GA4 can slice engagement
       and CTR by model and tally clicks by dealer. Add data-bst-track="source"
       to any anchor/button to track it; optional data-bst-vin / data-bst-dealer
       override the page vehicle's vin / dealer for that element. */
    function setupGA4(d) {
      /* Vehicle context merged into every VDP event. Per-element data-bst-vin /
         data-bst-dealer override vin / dealer_name (params win over vp below), so
         a similar-card click is attributed to the card's own vin/dealer while the
         page vehicle's make/model/segment ride along. */
      var vp = {
        vin:           d.vin,
        model_year:    d.year,
        vehicle_make:  d.make,
        vehicle_model: d.model,
        vehicle_trim:  d.trim,
        segment:       d.segment,
        dealer_name:   d.dealerName,
        listing_price: d.price
      };
      if (d.layout) vp.vdp_layout = d.layout;   /* pattern B pages, for the Phase 4 GA4 read */
  
      function fire(name, params) { if (typeof gtag === 'function') gtag('event', name, Object.assign({}, vp, params || {})); }
  
      /* Tagged pageview — the denominator for per-model engagement and CTR. */
      fire('view_vdp', {});
  
      var EVENT_MAP = {
        'main_cta':            'dealer_referral_click',
        'slim_cta':            'dealer_referral_click_sticky',
        'phone_chip':          'dealer_phone_tap',
        'email_chip':          'dealer_email_tap',
        'bespoke_dealer_link': 'dealer_referral_click_bespoke',
        'carfax_link':         'carfax_link_click',
        'similar_card':        'similar_listing_click',
        'segment_link':        'segment_link_click',
        'more_segment':        'back_link_click'
      };
  
      document.addEventListener('click', function(e) {
        var t = e.target.closest('[data-bst-track], a.bst-carfax-link, .bst-sc');
        if (!t) return;
  
        var source = t.getAttribute('data-bst-track');
        if (!source && t.classList.contains('bst-carfax-link')) source = 'carfax_link';
        if (!source && t.classList.contains('bst-sc')) source = 'similar_card';
        if (!source) return;
  
        /* Skip back-link "back" actions — the standalone back-link embed fires
           its own GA event because it calls preventDefault. */
        if (source === 'back_to_segment' || source === 'back_to_results') return;
  
        var eventName = EVENT_MAP[source] || 'dealer_referral_click';
        var params = {
          source: source,
          link_url: t.href || ''
        };
        var vin = t.getAttribute('data-bst-vin');
        var dealer = t.getAttribute('data-bst-dealer');
        if (vin)    params.vin = vin;
        if (dealer) params.dealer_name = dealer;
  
        fire(eventName, params);
      });
    }
  
    /* ── Linkify external dealer URLs in bespoke paragraphs ──
       Auto-styles + tags any anchor inside the green box that points off-site,
       so they pick up Carfax-link styling and GA4 tracking automatically. */
    function styleBespokeLinks(d) {
      var box = document.getElementById('bst-about-block');
      if (!box) return;
      var anchors = box.querySelectorAll('a[href]');
      anchors.forEach(function(a) {
        var href = a.getAttribute('href') || '';
        if (!href) return;
        var isExternal = /^https?:\/\//i.test(href) && href.indexOf(window.location.host) === -1;
        var isCarfax   = /carfax\.com/i.test(href);
        if (!isExternal) return;
  
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
  
        if (!a.hasAttribute('data-bst-track')) {
          a.setAttribute('data-bst-track', isCarfax ? 'carfax_link' : 'bespoke_dealer_link');
        }
        if (d.vin && !a.hasAttribute('data-bst-vin')) a.setAttribute('data-bst-vin', d.vin);
        if (d.dealerName && !a.hasAttribute('data-bst-dealer')) a.setAttribute('data-bst-dealer', d.dealerName);
  
        if (!a.classList.contains('bst-carfax-link')) {
          a.classList.add('bst-carfax-link');
        }
      });
    }
  
    /* ── Similar listings ── */
    function readItemsFromList(selector) {
      var wrap = document.querySelector(selector);
      if (!wrap) return [];
      var items = wrap.querySelectorAll('.w-dyn-item[data-vin]');
      var out = [];
      items.forEach(function(el) {
        var vin = el.getAttribute('data-vin');
        if (!vin) return;
        out.push({
          vin:       vin,
          slug:      el.getAttribute('data-slug') || '',
          year:      el.getAttribute('data-year')      || '',
          make:      el.getAttribute('data-make')      || '',
          model:     el.getAttribute('data-model')     || '',
          trim:      el.getAttribute('data-trim')      || '',
          price:     parseFloat(el.getAttribute('data-price')) || 0,
          miles:     parseFloat(el.getAttribute('data-miles')) || 0,
          hero:      el.getAttribute('data-hero-image-url') || '',
          dealer:    el.getAttribute('data-dealer-name')    || '',
          dealerCity: el.getAttribute('data-dealer-city')   || ''
        });
      });
      return out;
    }
  
    function pickRandom(arr, n) {
      var a = arr.slice();
      var result = [];
      for (var i = 0; i < n && a.length > 0; i++) {
        var idx = Math.floor(Math.random() * a.length);
        result.push(a.splice(idx, 1)[0]);
      }
      return result;
    }
  
    function scCardHTML(item) {
      var name   = [item.year, item.make, item.model, item.trim].filter(Boolean).join(' ');
      var dealer = (item.dealer || '').replace(/, CA$/i, '');
      var miles  = item.miles ? Math.round(item.miles).toLocaleString('en-US') + ' mi' : '';
      var price  = item.price ? '$' + Math.round(item.price).toLocaleString('en-US') : '';
      var img    = item.hero || '';
      var url    = '/used/' + (item.slug || item.vin);
      return '<a class="bst-sc" data-bst-track="similar_card" data-bst-vin="' + escapeHtml(item.vin) + '" data-bst-dealer="' + escapeHtml(item.dealer || '') + '" href="' + url + '">'
        + (img ? '<img class="bst-sc-img" src="' + escapeHtml(img) + '" alt="' + escapeHtml(name) + '" loading="lazy">' : '<div class="bst-sc-img"></div>')
        + '<div class="bst-sc-body">'
        + '<div class="bst-sc-checks">'
        + '<div class="bst-sc-check">' + CHECK_SVG_SM + ' Recommended model</div>'
        + '<div class="bst-sc-check">' + CHECK_SVG_SM + ' Approved dealer</div>'
        + '<div class="bst-sc-check">' + CHECK_SVG_SM + ' Qualified listing</div>'
        + '</div>'
        + '<div class="bst-sc-name">' + escapeHtml(name) + '</div>'
        + '<div class="bst-sc-dealer">' + escapeHtml(dealer) + '</div>'
        + '<div class="bst-sc-miles">' + escapeHtml(miles) + '</div>'
        + '<div class="bst-sc-price">' + escapeHtml(price) + '</div>'
        + '</div></a>';
    }
  
    function buildSimilar(d) {
      var modelSection = document.getElementById('bst-same-model-section');
      var modelRow     = document.getElementById('bst-same-model-row');
      var modelHeading = document.getElementById('bst-same-model-heading');
      var segSection   = document.getElementById('bst-same-segment-section');
      var segRow       = document.getElementById('bst-same-segment-row');
      var segHeading   = document.getElementById('bst-same-segment-heading');
  
      var modelPool = readItemsFromList('.bst-same-model-list');
      if (modelPool.length === 0) {
        modelPool = readItemsFromList('.best-same-model-list');
      }
  
      if (modelPool.length >= MIN_RESULTS) {
        if (modelHeading) modelHeading.textContent = 'More ' + d.make + ' ' + d.model + ' listings';
        if (modelRow) modelRow.innerHTML = pickRandom(modelPool, SHOW_COUNT).map(scCardHTML).join('');
        if (modelSection) modelSection.style.display = '';
      }
  
      var segPool = readItemsFromList('.bst-same-segment-list');
  
      if (segPool.length >= MIN_RESULTS) {
        if (segHeading && d.segment) segHeading.textContent = 'More ' + d.segment + ' listings';
        if (segRow) segRow.innerHTML = pickRandom(segPool, SHOW_COUNT).map(scCardHTML).join('');
        if (segSection) segSection.style.display = '';
      }
    }
  

    /* ── Pattern B modules (Phase 3): mock v13, built from the vdp/1 block ──
       Spec: staged/vdp-full-mock-2026-10-23/build_mock.py. Runs only for slugs on
       TEST_SLUGS (?bstb=0 shows the old page, ?bstb=1 forces it on any car with a block).
       Every module is all or nothing: a missing input drops it, nothing is guessed.
       Text comes from the server-rendered .bst-vdp-body rich text (vdp_body_html), split
       at each h2 into the ids in content.sections, and is moved (not copied) into place. */
    var TEST_SLUGS = ['2024-toyota-rav4-se-042833', '2023-hyundai-tucson-sel-242351'];

    function patternBOn(b) {
      if (!b || !b.listing || !b.bestest) return false;
      var q = ''; try { q = new URLSearchParams(window.location.search).get('bstb') || ''; } catch (e) {}
      if (q === '0') return false;
      return q === '1' || TEST_SLUGS.indexOf(b.listing.slug) > -1;
    }

    function plural(name) { return name + 's'; }
    function ordinal(n) {
      n = Math.round(n);
      var t = n % 100 >= 10 && n % 100 <= 20 ? 'th' : ({1: 'st', 2: 'nd', 3: 'rd'})[n % 10] || 'th';
      return n + t;
    }
    function fmtDate(iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
      if (!m) return '';
      var mon = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'][+m[2] - 1];
      return mon + ' ' + (+m[3]) + ', ' + m[1];
    }
    function listPhrase(a) {
      return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
    }

    function bodySections(b) {
      var el = document.querySelector('.bst-vdp-body');
      var out = {};
      if (!el) return out;
      var ids = (b.content && b.content.sections) || [], cur = null, i = -1;
      [].slice.call(el.children).forEach(function (n) {
        if (n.tagName === 'H2') { i++; cur = ids[i] || null; if (cur) out[cur] = []; }
        if (cur) out[cur].push(n);
      });
      return out;
    }

    function section(cls, nodes) {
      var sec = document.createElement('section');
      sec.className = 'bstb-card ' + cls;
      nodes.forEach(function (n) { sec.appendChild(n); });
      return sec;
    }

    function mListing(nodes) {
      if (!nodes || !nodes.length) return null;
      var sec = section('bstb-listing', nodes);
      sec.querySelector('h2').className = 'bstb-h2s';
      [].forEach.call(sec.querySelectorAll('a[href="#check-availability"]'), function (a) { a.classList.add('bstb-open-lead'); });
      return sec;
    }

    function mTake(nodes) {
      if (!nodes || !nodes.length) return null;
      var sec = section('bstb-take', nodes);
      sec.querySelector('h2').className = 'bstb-take-h';
      sec.insertAdjacentHTML('beforeend', '<div class="bstb-byline"><span class="bstb-ava" aria-hidden="true">JA</span><div><b>Jason Allan</b>'
        + '<small>Bestest founder and former head of vehicle reviews and ratings at Kelley Blue Book</small></div></div>');
      return sec;
    }

    function mFunnel(b, nodes) {
      var f = b.bestest.funnel, l = b.listing;
      if (!f || !f.oc_total || !nodes || !nodes.length) return null;
      var sec = section('bstb-funnel', nodes);
      var h2 = sec.querySelector('h2');
      h2.className = 'bstb-h2';
      var pct = Math.max(f.listed / f.oc_total * 100, 9);
      var label = f.oc_total + ' used ' + l.make + ' ' + plural(l.model) + ' for sale at Orange County dealers: '
        + f.listed + ' on Bestest, ' + f.rejected + ' rejected';
      h2.insertAdjacentHTML('afterend', '<div class="bstb-bar" role="img" aria-label="' + escapeHtml(label) + '">'
        + '<div class="bstb-f1" style="width:' + pct.toFixed(1) + '%">' + f.listed + '</div>'
        + '<div class="bstb-f2">' + f.rejected + ' rejected</div></div>');
      var how = document.createElement('div');
      how.className = 'bstb-how';
      nodes.slice(1).forEach(function (n) { how.appendChild(n); });
      sec.appendChild(how);
      var first = how.querySelector('p');
      if (first && first.querySelector('strong') && first.textContent.trim() === first.querySelector('strong').textContent.trim()) first.className = 'bstb-how-h';
      return sec;
    }

    function mBars(b) {
      var l = b.listing, bb = b.bestest, seg = bb.segment, ranks = bb.ranks || [];
      if (!seg || ranks.length < 3 || !seg.rejected || !seg.rejected.length) return null;
      var hasVariant = l.variant_model && l.variant_model !== l.model;
      function name(scope) { return hasVariant ? (scope === 'variant' ? l.variant_model : l.model + ' (all trims)') : l.model; }
      var rows = ranks.map(function (r) {
        var me = (r.of - r.rank + 1) / r.of * 100, rej = (r.of - r.rejected_avg + 1) / r.of * 100;
        return '<div class="bstb-row" role="img" aria-label="' + escapeHtml(r.label + ': ' + ordinal(r.rank) + ' of ' + r.of + '; the rejected models average ' + ordinal(r.rejected_avg)) + '">'
          + '<div class="bstb-lbl">' + escapeHtml(r.label) + '</div>'
          + '<div class="bstb-hb bstb-me" style="width:' + me.toFixed(1) + '%">' + escapeHtml(name(r.scope)) + '</div>'
          + '<div class="bstb-hb bstb-rej" style="width:' + rej.toFixed(1) + '%">Rejected models</div></div>';
      }).join('');
      var has = function (lbl) { return ranks.some(function (r) { return r.label === lbl; }); };
      var every = hasVariant ? ' (every ' + l.model + ')' : '';
      var f = bb.funnel;
      var cap = '<p>Gray is the average rank of the ' + seg.rejected.length + ' ' + seg.plural + ' Bestest rejects: ' + escapeHtml(listPhrase(seg.rejected)) + '.</p>'
        + (bb.reviews_year && (has('Car and Driver rating') || has('Kelley Blue Book rating') || has('Edmunds rating'))
            ? '<p><b>Reviews:</b> Car and Driver, Kelley Blue Book and Edmunds ratings of ' + bb.reviews_year + ' models.</p>' : '')
        + (has('Reliability') ? '<p><b>Reliability' + every + ':</b> expected repair bills at about 30,000 miles, from four insurers&rsquo; California rate filings.</p>' : '')
        + (has('Five-year resale') ? '<p><b>Resale' + every + ':</b> value kept after five years, from CarEdge and iSeeCars.</p>' : '')
        + (f && f.as_of ? '<p><b>Listings:</b> used ' + escapeHtml(plural(l.model)) + ' for sale at Orange County dealers on ' + fmtDate(f.as_of) + ' (Marketcheck) and on Bestest today.</p>' : '');
      var sec = document.createElement('section');
      sec.className = 'bstb-card bstb-why';
      sec.innerHTML = '<h2 class="bstb-h2">The ' + escapeHtml(l.model) + ' is one of the ' + seg.listed_models + ' ' + seg.plural
        + ' you&rsquo;ll find on Bestest. Here&rsquo;s how it compares with the ' + seg.rejected.length + ' models we reject.</h2>'
        + '<p class="bstb-sub">Bar length is rank among the ' + seg.scored_models + ' ' + seg.plural + ' Bestest scores; a full bar is first.</p>'
        + rows + '<div class="bstb-cap">' + cap + '</div>';
      return sec;
    }

    function fitBarLabels(sec) {   // if any gray name won't fit inside its bar, every gray name sits just outside
      var rej = sec.querySelectorAll('.bstb-rej');
      var tight = [].some.call(rej, function (x) { return x.scrollWidth > x.clientWidth + 1; });
      if (tight) [].forEach.call(rej, function (x) { x.setAttribute('data-l', x.textContent); x.textContent = ''; x.classList.add('bstb-out'); });
    }

    function slideCard(b) {
      var f = b.bestest.funnel, l = b.listing;
      var slides = document.querySelectorAll('.slider-3 .w-slider-mask .w-slide');
      if (!f || !f.oc_total || slides.length < 4) return;
      var card = document.createElement('div');
      card.className = slides[0].className;
      card.innerHTML = '<div class="bstb-slide"><div class="bstb-slide-logo">Best<span>est</span></div>'
        + '<p class="bstb-slide-top">Only ' + f.listed + ' of the ' + f.oc_total + ' used ' + escapeHtml(plural(l.model)) + ' for sale in Orange County made Bestest&rsquo;s cut.</p>'
        + '<p class="bstb-slide-big">This is one of them.</p>'
        + '<p class="bstb-slide-sm">Bestest already did the research for you. Shop the shortlist.</p></div>';
      slides[3].parentNode.insertBefore(card, slides[3]);
      try { window.Webflow.require('slider').redraw(); } catch (e) {}
    }

    function railB() {
      var rb = document.getElementById('bst-rail-bottom'), dist = document.getElementById('bst-dealer-distance');
      var miles = rb && rb.firstElementChild;
      if (miles && !miles.classList.contains('bst-cta-frame')) {
        miles.classList.add('bstb-rail-miles');
        if (dist) { dist.classList.add('bstb-rail-loc'); miles.insertAdjacentElement('afterend', dist); }
      }
      var tel = document.querySelector('#bst-main-cta-frame .bcf-phone-wrap');
      if (tel && tel.querySelector('.bcf-phone')) tel.insertAdjacentHTML('afterend', '<div class="bstb-call-note">Calls go straight to the dealer.</div>');
    }

    function slimB(b, d) {
      var t = document.querySelector('#bst-slim-bar .bsb-title'), m = document.querySelector('#bst-slim-bar .bsb-meta');
      if (t && b.listing.short_name) t.textContent = b.listing.short_name;
      if (m) m.textContent = [fmtPrice(d.price), d.miles ? fmtMiles(d.miles) + ' mi' : '', d.dealerCity].filter(Boolean).join(' · ');
    }

    function h1B(b) {
      var l = b.listing, h1 = document.querySelector('h1');
      if (!h1 || !l.variant_model || l.variant_model === l.model || h1.textContent.indexOf(l.variant_model) > -1) return;
      h1.textContent = h1.textContent.replace(new RegExp('(^|\\s)' + l.model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=\\s|$)'), '$1' + l.variant_model);
    }

    function similarB(b) {
      var l = b.listing, claim = b.bestest.claim;
      var same = document.getElementById('bst-same-model-section');
      var hd = document.getElementById('bst-same-model-heading');
      if (same && hd && same.style.display !== 'none') {
        var srp = SEGMENT_TO_SLUG[l.segment];
        hd.innerHTML = 'More Bestest-approved ' + escapeHtml(l.make + ' ' + plural(l.model))
          + (srp && claim && claim.kind === 'model'
              ? ' <a class="bstb-all" href="' + escapeHtml(srp + '?model=' + encodeURIComponent(l.model)) + '">See all ' + claim.count + ' on Bestest &rsaquo;</a>' : '');
        [].forEach.call(same.querySelectorAll('.bst-sc-checks'), function (c) {
          c.innerHTML = '<div class="bst-sc-check">' + CHECK_SVG_SM + ' Bestest-approved</div>';
        });
      }
      var segSec = document.getElementById('bst-same-segment-section');
      if (segSec) segSec.style.display = 'none';
      var brand = document.querySelector('.bst-brand-wrap');
      if (brand) brand.style.display = 'none';
    }

    function closerB(b) {
      var dl = b.dealer || {}, anchor = document.getElementById('bst-same-model-section');
      if (!anchor) return;
      var hasTake = ((b.content && b.content.sections) || []).indexOf('take') > -1;
      var addr = [dl.street, dl.city, ['CA', dl.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      var html = '<figure class="bstb-pq"><blockquote><p>If it&rsquo;s not on Bestest, just be careful.</p></blockquote>'
        + '<figcaption>Jason Allan, Bestest founder</figcaption></figure>';
      if (dl.name) {
        html += '<div class="bstb-seller"><b>For sale at</b> ' + escapeHtml(dl.name) + (addr ? ', ' + escapeHtml(addr) : '') + ', a Bestest-approved dealer. '
          + (b.bestest.approved_dealers ? 'Bestest lists cars from only ' + b.bestest.approved_dealers + ' of the more than 400 dealers selling used cars in Orange County, and ' + escapeHtml(dl.name) + ' is one of them. ' : '')
          + 'Listing and photos come from the dealer. The picks' + (hasTake ? ', ranks and Jason&rsquo;s take are' : ' and ranks are')
          + ' Bestest&rsquo;s own: Bestest isn&rsquo;t a dealer, isn&rsquo;t affiliated with any dealership, and no dealer or automaker pays to be listed or ranked.</div>';
      }
      anchor.insertAdjacentHTML('afterend', html);
    }

    function renderPatternB(b, d) {
      document.body.classList.add('bstb');
      var secs = bodySections(b);
      var about = document.getElementById('bst-about-block');
      if (about) {
        [mListing(secs.listing), mTake(secs.take), mFunnel(b, secs.funnel)].forEach(function (m) {
          if (m) about.parentNode.insertBefore(m, about);
        });
        var bars = mBars(b);
        if (bars) { about.insertAdjacentElement('afterend', bars); fitBarLabels(bars); }
        // the generic three-bullet card (no bespoke trim/model text) repeats the funnel, so it goes
        if (about.querySelector('.bst-about-bullets') && secs.funnel) about.style.display = 'none';
      }
      var body = document.querySelector('.bst-vdp-body');
      if (body && !body.querySelector('h2')) body.remove();
      slideCard(b);
      railB();
      slimB(b, d);
      h1B(b);
      similarB(b);
      closerB(b);
      document.addEventListener('click', function (e) {
        var t = e.target.closest && e.target.closest('.bstb-open-lead');
        if (!t) return;
        e.preventDefault();
        var cta = document.getElementById('bst-main-cta');
        if (cta) cta.click();
      });
    }

    function initLucide() {
      if (window.lucide) { lucide.createIcons(); }
      else {
        var s = document.querySelector('script[src*="lucide"]');
        if (!s) {
          s = document.createElement('script');
          s.src = LUCIDE_URL;
          document.head.appendChild(s);
        }
        s.addEventListener('load', function(){lucide.createIcons();});
      }
    }
  
    onReady(function () {
      var d = getData();
      if (!d) return;
      var blk = readBlock(), pb = patternBOn(blk);
      d.layout = pb ? 'b' : '';
      ensureMarkup();
      buildRightRail(d);
      renderDistanceLine(d);
      buildBelowFold(d);
      styleBespokeLinks(d);
      mountSlimBar(d);
      setupGA4(d);
      buildSimilar(d);
      if (pb) renderPatternB(blk, d);
      document.documentElement.classList.add('bst-vdp-ready');
      initLucide();
    });
  
  })();
})();
