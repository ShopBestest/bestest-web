// avoid-page.js — GA4 events for the per-model exclusion pages (/avoid/{slug}).
// Spec: exclusion-page-spec-2026-10-16.md §8. Events:
//   exclusion_page_view     { model, shape }           once per page view
//   alternative_card_click  { model, alternative }     on any .av-card-link click
//   vin_checker_submit      { model }                  when the checker form exists (week 4)
// The page body carries data-model and data-shape (set by exclusion_pages.py in the lead HTML wrapper
// or by the Designer template); cards carry data-model on .av-card and data-ev on the link.
(function () {
  function send(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
  }
  function pageModel() {
    var el = document.querySelector('[data-avoid-model]');
    var m = el ? el.getAttribute('data-avoid-model') : '';
    if (!m) { var p = location.pathname.match(/^\/avoid\/([^\/?#]+)/); m = p ? p[1] : ''; }
    return m;
  }
  function pageShape() {
    var el = document.querySelector('[data-avoid-shape]');
    return el ? el.getAttribute('data-avoid-shape') : '';
  }
  function init() {
    if (!/^\/avoid\//.test(location.pathname)) return;
    var model = pageModel(), shape = pageShape();
    send('exclusion_page_view', { model: model, shape: shape });
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest('a.av-card-link, a[data-ev="alternative_card_click"]');
      if (!a) return;
      var card = a.closest('.av-card');
      send('alternative_card_click', { model: model, alternative: card ? card.getAttribute('data-model') : '' });
    }, true);
    document.addEventListener('submit', function (ev) {
      if (ev.target && ev.target.matches('form[data-ev="vin_checker_submit"]')) send('vin_checker_submit', { model: model });
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
