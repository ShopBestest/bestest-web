/* Bestest lead form — replaces the VDP "Check availability" dealer link with a captured
 * lead. Intercepts clicks on any link to the dealer's listing URL, opens a centered modal,
 * and POSTs the buyer + vehicle context to the bestest-leads Worker. Concierge model: we
 * keep the dealer's listing URL on the lead so it can be relayed.
 *
 * Self-activates only on pages that have a dealer CTA (#bst-main-cta / #bst-slim-cta).
 * Class prefix bstlf- avoids collisions with the VDP's existing bcf-/bsb- classes.
 * Modal = card nested inside a flex backdrop (never self-centered fixed — that breaks
 * under Webflow's transformed wrappers; see the zip-pill saga). */
(function () {
  var ENDPOINT = (typeof window.BS_LEADS_URL === 'string' && window.BS_LEADS_URL) ||
    'https://bestest-leads.sweet-paper-5a21.workers.dev';
  var TERMS_URL = '/terms', PRIVACY_URL = '/privacy';

  // No listed-date line on the VDP (Jason 10/23): with the true earliest-seen date only
  // ~40% of cars are under two weeks old, so the line showed on some cars and not most.
  // The feed's fs still rides along as GA's days_listed param on lead events.
  // Same feed + sessionStorage cache as srp-engine.js (key/format shared deliberately:
  // an SRP visit earlier in the session makes this lookup free and instant).
  var FEED_URL = (typeof window.BS_FEED_URL === 'string' && window.BS_FEED_URL) ||
    'https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/';
  var FEED_CACHE_KEY = 'bestest_feed_cache_v3', FEED_CACHE_TTL_MS = 60 * 60 * 1000;

  // California CARS Act (SB 766, Civ. Code 1784.31 + 1784.43, operative 2026-10-01):
  // dealer-sold used cars at $50,000 or less get a 3-day right to cancel. Restocking
  // fee = 1.5% of price, min $200, max $600, plus $1/mile over 250 (max $150); void
  // past 400 miles. Every Bestest seller is a licensed CA dealer and the roster has no
  // motorcycles or 10,000+ lb GVWR trucks, so the only gate needed here is price.
  // Optional hub link: set window.BS_RETURN_HUB_URL once the rights hub is live.
  var RETURN_MAX_PRICE = 50000;
  function returnEligible(price) { var p = Number(price); return p > 0 && p <= RETURN_MAX_PRICE; }
  function restockingFee(price) { return Math.round(Math.min(600, Math.max(200, 0.015 * Number(price)))); }

  function readFeedCache() {
    try {
      var p = JSON.parse(sessionStorage.getItem(FEED_CACHE_KEY));
      if (!p || !p.timestamp || !p.records) return null;
      if (Date.now() - p.timestamp > FEED_CACHE_TTL_MS) return null;
      return p.records;
    } catch (e) { return null; }
  }

  function fetchFeed(cb) {
    var cached = readFeedCache();
    if (cached) { cb(cached); return; }
    fetch(FEED_URL, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('feed ' + r.status); return r.json(); })
      .then(function (records) {
        if (!Array.isArray(records) || !records.length) throw new Error('empty feed');
        try { sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), records: records })); } catch (e) {}
        cb(records);
      })
      .catch(function () { cb(null); });
  }

  // Days since this VDP's car entered the Bestest feed (record matched by /used/{slug}),
  // or null when unknown. Conservative: first-seen-by-Bestest, never the dealer's claim.
  function lookupListedDays(cb) {
    var m = location.pathname.match(/^\/used\/([^\/]+)\/?$/);
    if (!m) { cb(null); return; }
    var slug = decodeURIComponent(m[1]);
    fetchFeed(function (records) {
      if (!records) { cb(null); return; }
      for (var i = 0; i < records.length; i++) {
        if (records[i].slug === slug) {
          var fs = Date.parse(records[i].fs || '');
          if (isNaN(fs)) { cb(null); return; }
          cb(Math.max(0, Math.floor((Date.now() - fs) / 86400000)));
          return;
        }
      }
      cb(null);
    });
  }

  // One shared feed lookup per page: the modal uses it for GA's days_listed param.
  var daysListedCache, daysListedCbs = [];
  function getListedDays(cb) {
    if (daysListedCache !== undefined) { cb(daysListedCache); return; }
    daysListedCbs.push(cb);
    if (daysListedCbs.length > 1) return;
    lookupListedDays(function (days) {
      daysListedCache = days;
      daysListedCbs.splice(0).forEach(function (f) { f(days); });
    });
  }
  // ── VDP brand & conversion layer (2026-08-31 redesign) ──────────────────────
  // Pre-lead the dealer stays anonymous: the .bcf-dealer-line header (name +
  // "A BESTEST-APPROVED DEALER") is hidden — the checkmarks already claim dealer
  // approval, and the name returns in the post-submit confirmation. The segment tag
  // and current-page crumb go too (breadcrumb + claim panel carry the segment, the
  // H1 carries the name; dropping the crumb puts the CTA on the mobile landing
  // screen). CSS is injected at script-execute so none of it ever paints.
  (function vdpCss() {
    if (document.getElementById('bst-vdp-styles')) return;
    var s = document.createElement('style');
    s.id = 'bst-vdp-styles';
    s.textContent =
      '.bcf-dealer-line{display:none!important;}' +
      'a.bst-segment-link{display:none!important;}' +
      '.bst-crumb-current{display:none!important;}' +
      '.bst-claim-panel{margin:6px 0 10px;padding:12px 14px;background:#fff;border:1px solid #d8e4dc;border-radius:8px;}' +
      '.bst-claim-lead{margin:0 0 10px;font-size:14px;color:#0e1523;line-height:1.5;font-weight:500;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}' +
      '.bst-claim-lead b{font-weight:700;}' +
      '.bst-award{display:grid;grid-template-columns:64px minmax(0,1fr);column-gap:12px;align-items:center;margin:6px 0 12px;padding:14px 16px 14px 14px;background:#fffdf6;border:1.5px solid #d9b85c;border-radius:12px;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}' +
      '.bst-award-seal svg{display:block;width:64px;height:auto;}' +
      '.bst-award-body small{display:block;font-weight:800;font-size:10.5px;line-height:1.3;letter-spacing:.12em;text-transform:uppercase;color:#8a6d1f;}' +
      '.bst-award-lead{margin:3px 0 0;font-size:14.5px;line-height:1.45;font-weight:500;color:#1a1a1a;font-family:inherit;}.bst-award-lead b{font-weight:800;}' +
      '.bst-award-after{margin:-4px 0 10px;padding:0 2px;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}' +
      '.bst-award-after .bst-return-row{display:inline-flex;width:auto;gap:5px;margin:0;padding:0;border:0;font-size:12px;font-weight:500;color:#6b7280;line-height:1.4;}.bst-award-after .bst-return-row svg{display:none;}' +
      '.bst-award-after .bst-return-i{width:14px;height:14px;font-size:9px;}' +
      // CARS Act row: shield (not a 4th check, since the checks are Bestest's own vetting)
      '.bst-return-row{display:flex;align-items:center;gap:8px;width:100%;margin:10px 0 0;padding:10px 0 0;border:0;border-top:1px solid #e3ebe6;background:none;cursor:pointer;text-align:left;font-size:13px;color:#0e1523;line-height:1.4;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}' +
      '.bst-return-row svg{flex:none;width:16px;height:16px;}' +
      '.bst-return-i{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:1px solid #9aa8a0;border-radius:50%;font-size:10px;font-weight:700;color:#5b6b62;font-style:normal;}' +
      '.bst-return-info{margin:8px 0 0;font-size:12.5px;color:#3b4a42;line-height:1.5;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}' +
      '.bst-return-info p{margin:0 0 6px;font:inherit;color:inherit;}.bst-return-info a{color:#1a6f4a;font-weight:600;}' +
      '.bst-price-note{display:inline;margin-left:8px;padding:0;border:0;background:none;cursor:pointer;font-size:13px;font-weight:500;color:#6b7a72;vertical-align:middle;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}' +
      '.bst-price-detail{margin:2px 0 4px;font-size:12px;color:#6b7a72;line-height:1.4;font-family:\'Montserrat\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif;}';
    (document.head || document.documentElement).appendChild(s);
  })();

  // "Luxury Compact SUV" -> "luxury compact SUVs"; "Electric Vehicles" -> "electric vehicles"
  function segmentPhrase(seg) {
    var s = (seg || '').toLowerCase().replace(/\bsuvs?\b/g, function (m) { return m.toUpperCase(); });
    if (!s) return 'used cars';
    if (!/s$/i.test(s)) s += 's';
    return s;
  }

  function enhanceVdp() {
    var dd = dataDiv();
    if (!dd) { document.documentElement.classList.add('bst-claim-ready'); return; }

    // Claim panel: superlative headline + the existing checkmarks as its proof.
    // The checkmarks are rendered by a VDP embed AFTER DOMContentLoaded (same as the
    // CTA), so poll for them — a one-shot lookup here silently misses them in prod.
    function findChecks() {
      var rail = document.getElementById('bst-rail-top');
      if (!rail) return null;
      var checks = null;
      var divs = rail.getElementsByTagName('div');
      for (var i = 0; i < divs.length; i++) {
        var t = divs[i].textContent;
        // last match = innermost container holding exactly the three check rows
        if (/Recommended model/.test(t) && /Approved dealer/.test(t) && /Qualified listing/.test(t)) checks = divs[i];
      }
      return checks;
    }
    var panelTries = 0;
    var panelTimer = setInterval(function () {
      var checks = findChecks();
      if (checks) {
        clearInterval(panelTimer);
        if (document.querySelector('.bst-award')) return;
        /* The award (Jason, 11/12): the ratio is the claim, in gold, and gold belongs to this panel alone.
           The three checkmark rows are gone. New class names on purpose: the pasted VDP stylesheet styles .bst-claim-*. */
        var panel = document.createElement('div');
        panel.className = 'bst-award';
        panel.innerHTML = '<div class="bst-award-seal" aria-hidden="true">' + awardSeal() + '</div>' +
          '<div class="bst-award-body"><small>Bestest approved</small><p class="bst-award-lead">' + awardHtml(dd) + '</p></div>';
        checks.parentNode.insertBefore(panel, checks);
        checks.style.display = 'none';
        /* Nothing else rides in the award (Jason, 11/12): no certified line, no 3-day return. The return
           keeps its tap-to-explain as a grey line of its own just under the panel until the pricing
           details get their own home. */
        if (returnEligible(dd.price)) {
          var after = document.createElement('div');
          after.className = 'bst-award-after';
          panel.parentNode.insertBefore(after, panel.nextSibling);
          addReturnRow(after, dd.price);
        }
        addPriceNote(); // no-op if the init-time call already ran
        document.documentElement.classList.add('bst-claim-ready'); // releases vdp.css's rail reserve
      } else if (++panelTries > 40) { clearInterval(panelTimer); document.documentElement.classList.add('bst-claim-ready'); }
    }, 250);

    addPriceNote();

    // Hiding .bst-crumb-current can strand a trailing ">" separator — hide that too,
    // but only if the preceding element really is a bare separator.
    var cur = document.querySelector('.bst-crumb-current');
    if (cur && cur.previousElementSibling && /^[\s>\/›»·-]*$/.test(cur.previousElementSibling.textContent)) {
      cur.previousElementSibling.style.display = 'none';
    }

  }

  // Row under the checks + tap-to-open explainer that does this car's fee math.
  // Credits California law, never Bestest: we don't sell cars or guarantee returns.
  // "Only 37 of the 354 used Toyota RAV4s for sale in Orange County qualify as Bestest. This is one
  // of them." The counts are the block's model-level funnel; without them the block's claim sentence
  // (or the segment line) stands in. "Only" drops out once more than a third qualify.
  function awardHtml(dd) {
    var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var f = dd.funnel, c = dd.claim, noun = '';
    var m = c && c.kind === 'model' && c.text && String(c.text).match(/best (used .+?) for sale in/);
    if (m) noun = m[1];
    else if (dd.make && dd.model) noun = 'used ' + dd.make + ' ' + dd.model + (/s$/i.test(dd.model) ? '' : 's');
    var n = f && Number(f.listed), t = f && Number(f.oc_total);
    if (noun && n > 0 && t > 0 && n <= t) {
      var only = n / t <= 1 / 3 ? 'Only ' : '';
      var of = n + ' of the ' + t.toLocaleString('en-US') + ' ' + esc(noun);
      return n === 1
        ? '<b>' + only + of + '</b> for sale in Orange County qualifies as Bestest. This is it.'
        : '<b>' + only + of + '</b> for sale in Orange County qualify as Bestest. This is one of them.';
    }
    return (c && c.text) ? claimHtml(c) :
      'This is one of the <b>best ' + segmentPhrase(dd.segment) + '</b> for sale in Orange County right now.';
  }

  // Gold laurel wreath around a small dark green disc with a white, square-ended check.
  function awardSeal() {
    var s = '', side, i, deg, ang, x, y;
    for (side = -1; side <= 1; side += 2) for (i = 0; i < 7; i++) {
      deg = -70 + i * 23; ang = deg * Math.PI / 180;
      x = (30 + side * 24 * Math.cos(ang)).toFixed(1); y = (31 - 24 * Math.sin(ang)).toFixed(1);
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="2.5" ry="5.8" fill="#d9b85c" transform="rotate(' + (side * (28 - deg)) + ' ' + x + ' ' + y + ')"/>';
    }
    return '<svg viewBox="0 0 60 60" focusable="false">' + s + '<circle cx="30" cy="30" r="15.5" fill="#155539"/>' +
      '<g transform="translate(30 30) scale(.78) translate(-30.5 -30.5)"><path d="M19.5 30l8 8L42 22.5" fill="none" stroke="#fff" stroke-width="5.4"/></g></svg>';
  }

  function addReturnRow(panel, price) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'bst-return-row';
    row.setAttribute('aria-expanded', 'false');
    row.setAttribute('aria-controls', 'bst-return-info');
    row.innerHTML =
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2 2.5 3.3v4.1c0 3.4 2.3 6.2 5.5 7.4 3.2-1.2 5.5-4 5.5-7.4V3.3L8 1.2z" fill="#31b56b"/>' +
      '<path d="m5.4 8 1.8 1.8 3.5-3.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span>3-day return by California law</span><i class="bst-return-i" aria-hidden="true">i</i>';
    var info = document.createElement('div');
    info.id = 'bst-return-info';
    info.className = 'bst-return-info';
    info.hidden = true;
    var hub = (typeof window.BS_RETURN_HUB_URL === 'string' && window.BS_RETURN_HUB_URL) || '';
    info.innerHTML =
      '<p>Buy this car from the dealer for $50,000 or less, and California’s CARS Act lets you return it within 3 days for any reason.</p>' +
      '<p>For this car, the restocking fee would be about <b>' + fmtPrice(restockingFee(price)) + '</b>, plus $1 a mile for every mile over 250 (up to $150 more). ' +
      'It has to come back with 400 miles or fewer added, in the same condition.</p>' +
      '<p>This is a right California gives you, not a Bestest policy.' +
      (hub ? ' <a href="' + hub + '">How it works ›</a>' : '') + '</p>';
    row.addEventListener('click', function () {
      var opening = info.hidden;
      info.hidden = !opening;
      row.setAttribute('aria-expanded', String(opening));
      if (opening) track('return_info_open', { listing_price: Number(price) || undefined });
    });
    panel.appendChild(row);
    panel.appendChild(info);
  }

  // "+ tax & registration" after the server-rendered price (the element right after
  // #bst-rail-top). Tap reveals the full CARS Act "total price" wording.
  function addPriceNote() {
    var rail = document.getElementById('bst-rail-top');
    var el = rail && rail.nextElementSibling;
    if (!el || !/^\$[\d,]+$/.test(el.textContent.trim()) || el.querySelector('.bst-price-note')) return;
    var note = document.createElement('button');
    note.type = 'button';
    note.className = 'bst-price-note';
    note.setAttribute('aria-expanded', 'false');
    note.textContent = '+ tax & registration';
    var detail = document.createElement('div');
    detail.className = 'bst-price-detail';
    detail.hidden = true;
    detail.textContent = 'Dealer’s advertised price. Excludes tax, title, registration and government fees.';
    note.addEventListener('click', function () {
      detail.hidden = !detail.hidden;
      note.setAttribute('aria-expanded', String(!detail.hidden));
    });
    el.appendChild(note);
    el.parentNode.insertBefore(detail, el.nextSibling);
  }

  var CONSENT_TEXT ='By clicking Check availability, I agree to share my info with this dealer and ' +
    'to be contacted by Bestest and the dealer (and their agents) by email — and, if I provide my ' +
    'phone number, by call and text, including by automated means. This isn’t a condition of any ' +
    'purchase, and I can opt out anytime. Message and data rates may apply. See our Terms and Privacy Policy.';
  function consentHtml() {
    return CONSENT_TEXT
      .replace('Terms', '<a href="' + TERMS_URL + '" target="_blank" rel="noopener">Terms</a>')
      .replace('Privacy Policy', '<a href="' + PRIVACY_URL + '" target="_blank" rel="noopener">Privacy Policy</a>');
  }

  function dealerUrl() {
    var cta = document.getElementById('bst-main-cta') || document.getElementById('bst-slim-cta');
    var h = cta && cta.getAttribute('href');
    return (h && /^https?:\/\//.test(h)) ? h : null;
  }

  function vehicle() {
    var v = { title: '', vin: '', price: '', dealer: '' };
    var h1 = document.querySelector('h1');
    if (h1) v.title = h1.textContent.trim();
    var dn = document.querySelector('.bcf-dealer-name');
    if (dn) v.dealer = dn.textContent.trim();
    var s = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < s.length; i++) {
      try {
        var d = JSON.parse(s[i].textContent);
        var car = /Car|Vehicle|Product/.test(d['@type'] || '') ? d : null;
        if (!car && d['@graph']) {
          for (var j = 0; j < d['@graph'].length; j++) {
            if (/Car|Vehicle/.test(d['@graph'][j]['@type'] || '')) { car = d['@graph'][j]; break; }
          }
        }
        if (car) {
          if (car.name) v.title = car.name;
          if (car.vehicleIdentificationNumber) v.vin = car.vehicleIdentificationNumber;
          var off = car.offers && (Array.isArray(car.offers) ? car.offers[0] : car.offers);
          if (off && off.price != null) v.price = off.price;
          if (off && off.seller && (off.seller.name || off.seller)) v.dealer = off.seller.name || off.seller;
          break;
        }
      } catch (e) {}
    }
    return v;
  }

  // The listing's lead photo: the CMS data div's hero URL, else the page's og:image.
  function heroImage() {
    var el = document.getElementById('bst-vin-data');
    var u = (el && el.dataset.heroImageUrl) || '';
    if (!u) { var og = document.querySelector('meta[property="og:image"]'); u = (og && og.getAttribute('content')) || ''; }
    return /^https:\/\//.test(u) ? u : '';
  }

  // "31,315 miles" from the CMS data div, or '' when unknown.
  function carMiles() {
    var el = document.getElementById('bst-vin-data');
    var n = Number(el && el.dataset.miles);
    return n > 0 ? Math.round(n).toLocaleString('en-US') + ' miles' : '';
  }

  // "Westminster · 7 mi away" as vdp.js painted it (city only until the visitor's zip
  // resolves), else the dealer city from the data div.
  function carPlace() {
    var line = document.getElementById('bst-dealer-distance');
    var t = line && line.style.display !== 'none' ? line.textContent.replace(/\s+/g, ' ').trim() : '';
    if (t) return t;
    var el = document.getElementById('bst-vin-data');
    return (el && el.dataset.dealerCity) || '';
  }

  function fmtPrice(n) {
    var x = Number(n);
    return (!isNaN(x) && x > 0) ? '$' + Math.round(x).toLocaleString('en-US') : '';
  }

  // VDP vehicle fields: the vdp/1 data block (#bst-vdp-data, pattern B) when present,
  // else the CMS-bound data div (#bst-vin-data). model/trim stay the base names (GA4
  // dims, lead payload); variantModel/variantTrim ("RAV4 Hybrid") are for display.
  var _dd;
  function dataDiv() {
    if (_dd !== undefined) return _dd;
    _dd = blockData() || divData();
    return _dd;
  }
  function blockData() {
    var el = document.getElementById('bst-vdp-data');
    if (!el) return null;
    var raw = el.textContent || '', b = null;
    try { b = JSON.parse(raw); }
    catch (e) {   // a bound field may arrive entity-escaped; decode once and retry
      try { var t = document.createElement('textarea'); t.innerHTML = raw; b = JSON.parse(t.value); } catch (e2) {}
    }
    if (!b || b.schema !== 'vdp/1' || !b.listing) return null;
    var l = b.listing, dl = b.dealer || {};
    return {
      year: String(l.year || ''), make: l.make || '', model: l.model || '', trim: l.trim || '',
      variantModel: l.variant_model || l.model || '', variantTrim: l.variant_trim || l.trim || '',
      segment: l.segment || '', price: l.price != null ? String(l.price) : '', dealer: dl.name || '',
      vin: l.vin || '', dealerPhone: dl.phone || '', certified: !!l.certified,
      claim: (b.bestest && b.bestest.claim) || null,
      funnel: (b.bestest && b.bestest.funnel) || null
    };
  }
  function divData() {
    var el = document.getElementById('bst-vin-data');
    if (!el) return null;
    var d = el.dataset;
    /* The data div carries the base model ("CR-V"); the H1 carries the variant
       ("2024 Honda CR-V Hybrid Sport-L FWD"). Read the variant from the H1 when it
       sits between the year/make and the trim, so the form says "CR-V Hybrid". */
    var variantModel = d.model || '';
    var h1 = document.querySelector('h1');
    if (h1 && d.year && d.make && d.trim) {
      var esc = function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
      var m = new RegExp('^' + esc(d.year) + '\\s+' + esc(d.make) + '\\s+(.+?)\\s+' + esc(d.trim) + '(?:\\s|$)').exec(h1.textContent.trim());
      if (m && m[1].indexOf(d.model || '') === 0) variantModel = m[1];
    }
    return {
      year: d.year || '', make: d.make || '', model: d.model || '', trim: d.trim || '',
      variantModel: variantModel, variantTrim: d.trim || '',
      segment: d.segment || '', price: d.price || '', dealer: d.dealerName || '', vin: d.vin || '',
      dealerPhone: d.dealerPhone || '', certified: d.isCertified === 'true', claim: null, funnel: null
    };
  }

  // The block's claim sentence, with its count phrase in bold ("One of the <b>39 best
  // used Toyota RAV4s</b> for sale in Orange County right now.").
  function claimHtml(c) {
    var t = String(c.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return t.replace(/^(One of the |The )(.+?)( for sale in| that made)/, '$1<b>$2</b>$3');
  }

  function injectStyles() {
    if (document.getElementById('bstlf-styles')) return;
    var s = document.createElement('style');
    s.id = 'bstlf-styles';
    s.textContent =
      ".bstlf-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:none;align-items:center;justify-content:center;padding:16px;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;}" +
      ".bstlf-backdrop.bstlf-open{display:flex;}" +
      ".bstlf-card,.bstlf-card *{font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;}" +
      ".bstlf-card{position:relative;background:#fff;border-radius:14px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;padding:24px 22px;box-shadow:0 16px 48px rgba(0,0,0,.2);box-sizing:border-box;}" +
      ".bstlf-close{position:absolute;top:8px;right:12px;width:30px;height:30px;border:none;background:transparent;color:#999;font-size:22px;line-height:1;cursor:pointer;padding:0;}" +
      ".bstlf-title{font-size:18px;font-weight:700;color:#0e1523;margin:0 6px 4px 0;line-height:1.3;}" +
      // Car summary card (11/11): photo + name + price, so the pop-up shows the car it is about.
      ".bstlf-car{display:flex;align-items:center;gap:12px;margin:10px 0 12px;padding:8px;border:1px solid #e3ebe6;border-radius:10px;}" +
      ".bstlf-car-img{flex:none;width:92px;height:69px;object-fit:cover;border-radius:6px;background:#f1f4f2;}" +
      ".bstlf-car-txt{min-width:0;}" +
      ".bstlf-veh{font-size:14px;font-weight:600;color:#0e1523;margin:0;line-height:1.35;}" +
      ".bstlf-car-price{font-size:15px;font-weight:700;color:#0e1523;margin:2px 0 0;line-height:1.3;}" +
      ".bstlf-car-meta{font-size:12.5px;font-weight:500;color:#4b5563;margin:2px 0 0;line-height:1.4;}" +
      ".bstlf-car-ok{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#1a6f4a;margin:4px 0 0;line-height:1.3;}" +
      ".bstlf-car-ok svg{flex:none;width:14px;height:14px;}" +
      ".bstlf-note{font-size:13px;font-weight:500;color:#4b5563;margin:0 0 14px;line-height:1.5;}" +
      ".bstlf-field{margin-bottom:10px;}" +
      ".bstlf-name-row{display:flex;gap:10px;}" +
      ".bstlf-name-row .bstlf-input{flex:1 1 0;min-width:0;}" +
      ".bstlf-input{width:100%;padding:10px 12px;border:1px solid #d0d0d0;border-radius:8px;font-size:15px;font-family:inherit;color:#1a1a1a;box-sizing:border-box;outline:none;transition:border-color .15s;}" +
      ".bstlf-input:focus{border-color:#1a6f4a;}" +
      ".bstlf-input.bstlf-err{border-color:#c0392b;}" +
      "textarea.bstlf-input{min-height:88px;line-height:1.45;resize:vertical;}" +
      ".bstlf-consent{font-size:11px;color:#6b7280;line-height:1.45;margin:10px 0 0;}" +
      ".bstlf-consent a{color:#1a6f4a;text-decoration:underline;}" +
      ".bstlf-submit{width:100%;margin-top:12px;padding:13px;background:#1a6f4a;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:background .15s;}" +
      ".bstlf-submit:hover{background:#155539;}" +
      ".bstlf-submit:disabled{opacity:.6;cursor:default;}" +
      ".bstlf-err-msg{color:#c0392b;font-size:12px;margin-top:6px;}" +
      ".bstlf-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;}" +
      ".bstlf-done{text-align:center;padding:8px 0;}" +
      ".bstlf-done h3{font-size:18px;font-weight:700;color:#1a6f4a;margin:0 0 8px;}" +
      ".bstlf-done p{font-size:14px;color:#555;line-height:1.5;margin:0;}";
    (document.head || document.documentElement).appendChild(s);
  }

  var backdrop, openedAt = 0, ctx = {};

  function build() {
    if (backdrop) return;
    injectStyles();
    backdrop = document.createElement('div');
    backdrop.className = 'bstlf-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'bstlf-title');
    backdrop.innerHTML =
      '<div class="bstlf-card" role="document">' +
        '<button type="button" class="bstlf-close" aria-label="Close">×</button>' +
        '<div class="bstlf-form-wrap">' +
          '<h2 class="bstlf-title" id="bstlf-title">Check availability</h2>' +
          '<div class="bstlf-car">' +
            '<img class="bstlf-car-img" alt="" hidden>' +
            '<div class="bstlf-car-txt"><p class="bstlf-veh"></p><p class="bstlf-car-price"></p><p class="bstlf-car-meta"></p>' +
              '<p class="bstlf-car-ok"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#31b56b"/><path d="M5.6 10.3l2.7 2.7 5.9-6.3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Bestest approved</span></p>' +
            '</div>' +
          '</div>' +
          '<p class="bstlf-note">Ask the dealer to confirm it’s still available. They’ll reply by email.</p>' +
          '<form class="bstlf-form" novalidate>' +
            '<input class="bstlf-hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<div class="bstlf-field bstlf-name-row">' +
              '<input class="bstlf-input bstlf-first" type="text" placeholder="First name" aria-label="First name" autocomplete="given-name">' +
              '<input class="bstlf-input bstlf-last" type="text" placeholder="Last name" aria-label="Last name" autocomplete="family-name">' +
            '</div>' +
            '<div class="bstlf-field"><input class="bstlf-input bstlf-email" type="email" placeholder="Email" aria-label="Email" autocomplete="email" inputmode="email"></div>' +
            '<div class="bstlf-field"><input class="bstlf-input bstlf-phone" type="tel" placeholder="Phone (optional)" aria-label="Phone (optional)" autocomplete="tel" inputmode="tel"></div>' +
            '<div class="bstlf-field"><textarea class="bstlf-input bstlf-message" aria-label="Message to the dealer" placeholder="Anything you’d like the dealer to know?"></textarea></div>' +
            '<button type="submit" class="bstlf-submit">Check availability</button>' +
            '<p class="bstlf-consent">' + consentHtml() + '</p>' +
            '<div class="bstlf-err-msg" aria-live="polite"></div>' +
          '</form>' +
        '</div>' +
        '<div class="bstlf-done" style="display:none">' +
          '<h3>You’re all set</h3>' +
          '<p>We’ll connect you with the dealer about this vehicle shortly — keep an eye on your phone and email.</p>' +
        '</div>' +
      '</div>';
    (document.body || document.documentElement).appendChild(backdrop);

    var card = backdrop.querySelector('.bstlf-card');
    var form = backdrop.querySelector('.bstlf-form');
    var errMsg = backdrop.querySelector('.bstlf-err-msg');
    var submit = backdrop.querySelector('.bstlf-submit');

    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    card.addEventListener('click', function (e) { e.stopPropagation(); });
    backdrop.querySelector('.bstlf-close').addEventListener('click', close);
    backdrop.querySelector('.bstlf-car-img').addEventListener('error', function () { this.hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('bstlf-open')) close();
    });

    function val(sel) { return (backdrop.querySelector(sel).value || '').trim(); }
    function flagErr(sel, bad) { backdrop.querySelector(sel).classList.toggle('bstlf-err', !!bad); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errMsg.textContent = '';
      var first = val('.bstlf-first'), last = val('.bstlf-last');
      var name = (first + ' ' + last).trim();
      var email = val('.bstlf-email'), phone = val('.bstlf-phone');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var phoneOk = phone === '' || phone.replace(/\D/g, '').length >= 10; // phone is optional
      flagErr('.bstlf-first', !first); flagErr('.bstlf-last', !last);
      flagErr('.bstlf-email', !emailOk); flagErr('.bstlf-phone', phone !== '' && !phoneOk);
      if (!first || !last || !emailOk) { errMsg.textContent = 'Please enter your first name, last name, and a valid email.'; return; }
      if (!phoneOk) { errMsg.textContent = 'That phone number looks incomplete — fix it or leave it blank.'; return; }
      // By-clicking consent: submitting the form IS the agreement (disclosure shown above).

      submit.disabled = true; submit.textContent = 'Sending…';
      var payload = {
        name: name, email: email, phone: phone,
        message: val('.bstlf-message'),
        financing_interest: false,
        trade_in: false,
        consent: true, consent_text: CONSENT_TEXT,
        company: val('.bstlf-hp'),
        elapsed_ms: Date.now() - openedAt,
        vehicle_title: ctx.title, vin: ctx.vin, price: ctx.price,
        dealer_name: ctx.dealer, dealer_listing_url: ctx.dealerUrl, vdp_url: location.href
      };
      // 12 s client timeout (2026-10-13): the Worker now answers in well under a second
      // (KV-first; Airtable happens after the response), so anything longer is the
      // network, and the shopper should get the dealer's number instead of a spinner.
      var SUBMIT_TIMEOUT_MS = 12000;
      var aborter = (typeof AbortController === 'function') ? new AbortController() : null;
      var timedOut = false;
      var timer = setTimeout(function () { timedOut = true; if (aborter) aborter.abort(); }, SUBMIT_TIMEOUT_MS);
      var t0 = Date.now();
      fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        signal: aborter ? aborter.signal : undefined
      }).then(function (r) { return r.json().catch(function () { return { ok: r.ok, error: 'http_' + r.status }; }); })
        .then(function (res) {
          clearTimeout(timer);
          if (res && res.ok) {
            backdrop.querySelector('.bstlf-form-wrap').style.display = 'none';
            backdrop.querySelector('.bstlf-done').style.display = 'block';
            track('generate_lead', ctxParams({ value: (Number(ctx.price) > 0 ? Number(ctx.price) : undefined), currency: 'USD', submit_ms: Date.now() - t0 }));
          } else { throw new Error((res && res.error) || 'failed'); }
        })
        .catch(function (err) {
          clearTimeout(timer);
          submit.disabled = false; submit.textContent = 'Check availability';
          var reason = timedOut ? 'timeout' : ((err && err.message) || 'network');
          var phone = ctx.dealerPhone ? ' Or call ' + (ctx.dealer || 'the dealer') + ' at ' + ctx.dealerPhone + '.' : ' Or call the dealer.';
          errMsg.textContent = (timedOut ? 'That took too long to send. Please try once more.' : 'Something went wrong sending that. Please try again.') + phone;
          track('lead_form_submit_error', ctxParams({ error: String(reason).slice(0, 60), submit_ms: Date.now() - t0 }));
        });
    });
  }

  function track(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
  }

  // Vehicle context attached to every lead event, mirroring the VDP embed's vp
  // param names (view_vdp etc.) so GA4 can slice lead CTR + conversion by
  // model/make/segment and tally leads by dealer. gtag drops undefined params.
  function ctxParams(extra) {
    var priceNum = Number(ctx.price);
    var p = {
      vin:           ctx.vin || undefined,
      model_year:    ctx.year || undefined,
      vehicle_make:  ctx.make || undefined,
      vehicle_model: ctx.model || undefined,
      vehicle_trim:  ctx.trim || undefined,
      segment:       ctx.segment || undefined,
      dealer_name:   ctx.dealer || undefined,
      listing_price: (priceNum > 0 ? priceNum : undefined),
      days_listed:   (typeof ctx.daysListed === 'number' ? ctx.daysListed : undefined),
      return_eligible: (priceNum > 0 ? (returnEligible(priceNum) ? 'yes' : 'no') : undefined)
    };
    if (extra) for (var k in extra) p[k] = extra[k];
    return p;
  }

  function open(url, e) {
    if (e) { e.preventDefault(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
    build();
    var v = vehicle();
    var dd = dataDiv();
    var shortName = (dd && [dd.year, dd.make, dd.variantModel].filter(Boolean).join(' ')) || v.title;
    var longName  = (dd && [dd.certified ? 'Certified' : 'Used', dd.year, dd.make, dd.variantModel, dd.variantTrim].filter(Boolean).join(' ')) || v.title;
    var price  = (dd && dd.price) || v.price;
    var dealer = (dd && dd.dealer) || v.dealer;
    ctx = {
      title: v.title, vin: (dd && dd.vin) || v.vin, price: price, dealer: dealer, dealerUrl: url,
      dealerPhone: (dd && dd.dealerPhone) || '',
      year: (dd && dd.year) || '', make: (dd && dd.make) || '', model: (dd && dd.model) || '',
      trim: (dd && dd.trim) || '', segment: (dd && dd.segment) || ''
    };

    // reset to a fresh form each open
    backdrop.querySelector('.bstlf-form-wrap').style.display = 'block';
    backdrop.querySelector('.bstlf-done').style.display = 'none';
    backdrop.querySelector('.bstlf-form').reset();
    backdrop.querySelector('.bstlf-err-msg').textContent = '';
    var sub = backdrop.querySelector('.bstlf-submit'); sub.disabled = false; sub.textContent = 'Check availability';

    // Pre-lead the dealer stays anonymous here too (name still rides the payload and
    // GA params, and is revealed in the confirmation). Urgency lives on the VDP; the
    // modal shows the car (photo, name, price) and one plain line on what happens next.
    backdrop.querySelector('.bstlf-veh').textContent = longName;
    // Price and mileage share a line; the dealer's city and distance sit under it, read
    // from the VDP's own location line so the two can never disagree.
    var milesStr = carMiles();
    backdrop.querySelector('.bstlf-car-price').textContent = [fmtPrice(price), milesStr].filter(Boolean).join(' · ');
    var meta = backdrop.querySelector('.bstlf-car-meta');
    meta.textContent = carPlace();
    meta.style.display = meta.textContent ? '' : 'none';
    var img = backdrop.querySelector('.bstlf-car-img');
    var photo = heroImage();
    if (photo) { img.src = photo; img.hidden = false; } else { img.hidden = true; }

    var openToken = openedAt = Date.now();
    getListedDays(function (days) {
      if (openToken === openedAt && days != null) ctx.daysListed = days;
    });

    // Prefill an editable, low-pressure message naming the exact car + price.
    var priceStr = fmtPrice(price);
    backdrop.querySelector('.bstlf-message').value =
      'I’d like to know if the ' + longName + ' listed on Bestest' +
      (priceStr ? ' for ' + priceStr : '') + ' is still available.';

    // Personalize the confirmation: name the car, then sell the dealer's vetting.
    backdrop.querySelector('.bstlf-done p').textContent =
      'We’ve sent your interest in this ' + shortName + ' to ' + (dealer || 'the dealer') +
      ', a factory-authorized, Bestest-approved Orange County dealer. Expect them to get back to ' +
      'you shortly. Thanks for using Bestest!';

    backdrop.classList.add('bstlf-open');
    // Grow the message box to fit the prefilled sentence (it was clipped mid-line).
    // Measured a frame after the modal paints (a same-tick read on first open saw a
    // zero-width box) and capped so a bad measurement can never blow up the card.
    var ta = backdrop.querySelector('.bstlf-message');
    ta.style.height = '';
    var fit = function () {
      if (!ta.clientWidth) return;
      ta.style.height = 'auto';
      ta.style.height = Math.min(180, ta.scrollHeight + 2) + 'px';
    };
    if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(fit); }); else setTimeout(fit, 50);
    track('lead_form_open', ctxParams());
    setTimeout(function () { var n = backdrop.querySelector('.bstlf-first'); if (n) n.focus(); }, 60);
  }

  function close() { if (backdrop) backdrop.classList.remove('bstlf-open'); }

  function init() {
    // Attach the interceptor UNCONDITIONALLY. The dealer CTA is built by another VDP
    // embed AFTER DOMContentLoaded, so we can't gate on it existing yet — resolve the
    // dealer URL at click time, and match the CTA by id as a fallback. Capture phase +
    // stopImmediatePropagation/preventDefault fully swallow the click (incl. target=_blank).
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a');
      if (!a) return;
      var cur = dealerUrl();
      var isDealerLink = a.id === 'bst-main-cta' || a.id === 'bst-slim-cta' ||
        (cur && a.getAttribute('href') === cur);
      if (!isDealerLink) return;
      open(a.getAttribute('href') || cur, e);
    }, true);

    enhanceVdp();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.BestestLeadForm = { open: function () { open(dealerUrl()); }, close: close };
})();
