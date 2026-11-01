/* srp-reminders.js — "you're still on a results page" reminders for the segment SRPs.
 *
 * Two things, both driven by the live feed that srp-engine.js already loaded:
 *
 *  1. Model chips. Every per-model blurb in the editorial section below the grid carries a
 *     link to that model's filtered SRP (a.bst-ed-link[data-model="RAV4"] in the CMS embed).
 *     This script rewrites that link's text to "12 for sale · from $24.9K →", counting the
 *     cars that match the page's current filters, and points its href at the same filters
 *     plus model=RAV4. A model with 0 matching cars renders nothing. The link stays a plain
 *     <a href> (server-rendered by Webflow), so it is crawlable with or without this script.
 *
 *  2. Mobile pill. "↑ 143 compact SUVs", fixed at the bottom of the phone screen while the
 *     results grid is scrolled out of view above. Tapping it scrolls back to the filter bar
 *     and grid. Desktop never shows it (CSS media query + nothing to show).
 *
 * Reads only the public API srp-engine.js exposes (window.Bestest: state, getAllItems,
 * getData, onReady) and re-runs whenever the engine re-renders the grid (MutationObserver on
 * .collection-list-2). No edits to srp-engine.js are needed.
 *
 * Markup contract for the chips (either form; the first is what the CMS embed already has):
 *   <a class="bst-ed-link" data-model="RAV4" href="/used-cars/best-used-compact-suvs?model=RAV4">…</a>
 *   <a data-bsr-model="RAV4" data-bsr-make="Toyota" href="…?model=RAV4">…</a>
 * data-make / data-bsr-make is optional and only narrows the count when two makes share a
 * model name. The href is rewritten at runtime; the authored href is the crawlable fallback.
 *
 * Optional page hooks:
 *   window.BS_SEGMENT_PLURAL = 'Compact SUVs'  // pill label; otherwise read from the band
 */
(function () {
  'use strict';
  if (window.__bsrLoaded) return;
  window.__bsrLoaded = true;

  var CHIP_SELECTOR = 'a.bst-ed-link[data-model], a[data-bsr-model]';
  var SCROLL_OFFSET = 64;      // clears the bsx sticky band when scrolling back up
  var MOBILE_QUERY = '(max-width: 767px)';   // same breakpoint srp-engine uses for mobile

  // ── Filter logic, mirrored from srp-engine.js ────────────────────────────────────────────
  // The engine does not expose its filtered list, so the same predicate is applied here to
  // the records it does expose. Keep these tables in step with FILTERS in srp-engine.js.
  var HYBRID_PT = ['HEV', 'Hybrid', 'PHEV', 'Plug-in Hybrid', 'Plug-In Hybrid'];
  var BODY_MATCH = { 'SUV': ['SUV', 'Wagon'], 'Car': ['Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Targa'], 'Truck': ['Pickup'], 'Minivan': ['Minivan'] };
  var PT_MATCH = { 'HEV': ['HEV', 'Hybrid'], 'PHEV': ['PHEV', 'Plug-in Hybrid', 'Plug-In Hybrid'], 'BEV': ['BEV', 'EV'] };

  function expand(vals, map) {
    var out = [];
    (vals || []).forEach(function (v) {
      (map[v] || [v]).forEach(function (m) { if (out.indexOf(m) === -1) out.push(m); });
    });
    return out;
  }
  function inList(val, list) { return !list || !list.length || list.indexOf(val) !== -1; }
  function inRange(val, ranges) {
    if (!ranges || !ranges.length) return true;
    for (var i = 0; i < ranges.length; i++) {
      var p = ranges[i].split('-');
      if (val >= parseInt(p[0], 10) && val <= parseInt(p[1], 10)) return true;
    }
    return false;
  }
  function segmentOk(d, segs) {
    if (inList(d.segment, segs)) return true;
    return segs.indexOf('Hybrids') !== -1 && HYBRID_PT.indexOf(d.powertrain) !== -1;
  }
  // ignoreMakeModel: the chips are per-model links, so each model is counted with every
  // filter except make/model applied (the same way the engine computes availability for
  // its own model dropdown). The pill counts with every filter applied.
  function matches(d, st, ignoreMakeModel) {
    if (!ignoreMakeModel && !(inList(d.make, st.make) && inList(d.model, st.model))) return false;
    return segmentOk(d, st.segment || []) &&
      inList(d.body_type, expand(st.body_style, BODY_MATCH)) &&
      inList(d.powertrain, expand(st.powertrain, PT_MATCH)) &&
      inRange(d.price, st.price) &&
      inRange(d.miles, st.miles) &&
      inList(d.year, st.year) &&
      inList(d.certified, st.certified);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────────────────
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmtInt(n) { return n.toLocaleString('en-US'); }
  // $24,900 → $24.9K · $25,000 → $25K · $112,500 → $113K · $9,800 → $9,800
  function fmtK(n) {
    if (!(n > 0)) return '';
    if (n < 10000) return '$' + fmtInt(n);
    if (n >= 100000) return '$' + Math.round(n / 1000) + 'K';
    var k = Math.round(n / 100) / 10;
    return '$' + (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K';
  }
  // "Compact SUVs" → "compact SUVs"; "Electric Vehicles" → "electric vehicles"
  function sentenceCase(s) {
    return String(s).trim().split(/\s+/).map(function (w) { return /[A-Z]{2,}/.test(w) ? w : w.toLowerCase(); }).join(' ');
  }
  function track(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
  }
  function records() {
    var all = window.Bestest.getAllItems() || [];
    var get = window.Bestest.getData || function (r) { return r; };
    return all.map(get);
  }
  function state() { return window.Bestest.state || {}; }

  // Model-filtered URL for this page: the current query string (which srp-engine keeps in
  // step with its filter state, prefilter facets excluded) with model= set to this model.
  function modelHref(model) {
    var p = new URLSearchParams(window.location.search);
    p.set('model', model);
    var qs = p.toString();
    return window.location.pathname + (qs ? '?' + qs : '');
  }

  // ── 1. Model chips ───────────────────────────────────────────────────────────────────────
  function renderChips(items, st) {
    var links = document.querySelectorAll(CHIP_SELECTOR);
    if (!links.length) return;
    var stats = {};
    function bump(key, price) {
      var s = stats[key] || (stats[key] = { n: 0, min: 0 });
      s.n++;
      if (price > 0 && (!s.min || price < s.min)) s.min = price;
    }
    for (var i = 0; i < items.length; i++) {
      var d = items[i];
      if (!d.model || !matches(d, st, true)) continue;
      bump(d.model, d.price);
      if (d.make) bump(d.make + '|' + d.model, d.price);
    }
    Array.prototype.forEach.call(links, function (a) {
      var model = a.getAttribute('data-bsr-model') || a.getAttribute('data-model');
      var make = a.getAttribute('data-bsr-make') || a.getAttribute('data-make');
      if (!model) return;
      var s = stats[make ? make + '|' + model : model];
      a.classList.add('bsr-chip');
      if (!s || !s.n) {
        // 0 for sale: render nothing. (The class, not the hidden attribute, decides visibility
        // so the older inline count script in the CMS embed can't flip it back on.)
        a.classList.add('bsr-chip-empty');
        a.setAttribute('aria-hidden', 'true');
        a.setAttribute('tabindex', '-1');
        return;
      }
      a.classList.remove('bsr-chip-empty');
      a.removeAttribute('aria-hidden');
      a.removeAttribute('tabindex');
      a.removeAttribute('hidden');
      a.setAttribute('href', modelHref(model));
      var label = fmtInt(s.n) + ' for sale' + (s.min ? ' · ' + (s.n === 1 ? '' : 'from ') + fmtK(s.min) : '');
      a.innerHTML = '<span class="bsr-chip-label">' + esc(label) + '</span> <span class="bsr-chip-arrow" aria-hidden="true">\u2192</span>';
      a.setAttribute('aria-label', label + ': see ' + (make ? make + ' ' : '') + model + ' listings');
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a.bsr-chip') : null;
    if (a) track('srp_model_chip_click', { model: a.getAttribute('data-bsr-model') || a.getAttribute('data-model') || '' });
  }, true);

  // ── 2. Mobile pill ───────────────────────────────────────────────────────────────────────
  var pill = null, pillText = null, pillGridAbove = false;

  function segmentLabel() {
    if (typeof window.BS_SEGMENT_PLURAL === 'string' && window.BS_SEGMENT_PLURAL.trim()) return sentenceCase(window.BS_SEGMENT_PLURAL);
    var el = document.querySelector('.bsx-seglink-text');
    var txt = el ? el.textContent.trim() : '';
    if (txt && !/^all cars$/i.test(txt)) return sentenceCase(txt);
    return 'cars';
  }

  function scrollBackToResults() {
    var target = document.getElementById('bs-bar') || document.querySelector('.collection-list-2');
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' }); }
    catch (err) { window.scrollTo(0, Math.max(0, y)); }
  }

  function setupPill(grid) {
    if (pill || !('IntersectionObserver' in window)) return;
    pill = document.createElement('a');
    pill.id = 'bsr-pill';
    pill.className = 'bsr-pill';
    pill.href = '#bs-bar';
    pill.setAttribute('aria-label', 'Back to the results');
    pill.innerHTML = '<span class="bsr-pill-arrow" aria-hidden="true">\u2191</span> <span class="bsr-pill-text"></span>';
    pillText = pill.querySelector('.bsr-pill-text');
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();   // Webflow's own '#' handler would otherwise land under the sticky band
      track('srp_pill_click', { count: parseInt(pillText.textContent, 10) || 0 });
      scrollBackToResults();
    });
    document.body.appendChild(pill);

    var io = new IntersectionObserver(function (entries) {
      var en = entries[entries.length - 1];
      // Show only once the grid has scrolled up and out of view (not while it is still below the fold).
      pillGridAbove = !en.isIntersecting && en.boundingClientRect.bottom <= 0;
      updatePillVisibility();
    }, { threshold: 0 });
    io.observe(grid);
  }

  function updatePillVisibility() {
    if (!pill) return;
    var mobile = window.matchMedia(MOBILE_QUERY).matches;
    pill.classList.toggle('bsr-on', mobile && pillGridAbove);
  }

  function renderPill(items, st) {
    if (!pillText) return;
    var n = 0;
    for (var i = 0; i < items.length; i++) if (matches(items[i], st, false)) n++;
    pillText.textContent = fmtInt(n) + ' ' + segmentLabel();
    updatePillVisibility();
  }

  // ── Wiring ───────────────────────────────────────────────────────────────────────────────
  var scheduled = false;
  function update() {
    if (scheduled) return;
    scheduled = true;
    (window.requestAnimationFrame || setTimeout)(function () {
      scheduled = false;
      if (!window.Bestest || !window.Bestest.isReady || !window.Bestest.isReady()) return;
      var items = records();
      var st = state();
      renderChips(items, st);
      renderPill(items, st);
    });
  }

  function init() {
    var grid = document.querySelector('.collection-list-2');
    if (!grid) return;
    setupPill(grid);
    // srp-engine replaces the grid's innerHTML on every render (filter, sort, page, popstate),
    // which is the one reliable "state changed" signal it gives without a code change.
    if ('MutationObserver' in window) new MutationObserver(update).observe(grid, { childList: true });
    window.addEventListener('popstate', update);
    window.addEventListener('resize', updatePillVisibility);
    window.Bestest.onReady(function () {
      update();
      // bsx-band renders its chip row on the same onReady tick; the band label may not exist yet.
      setTimeout(update, 400);
    });
  }

  var tries = 0;
  (function waitForBestest() {
    if (window.Bestest && typeof window.Bestest.onReady === 'function') { init(); return; }
    if (++tries < 300) setTimeout(waitForBestest, 100);   // give up after ~30s (not an engine page)
  })();
})();
