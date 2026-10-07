/* Bestest: one-line MyFirstEV promo under the intro on EV search pages.
   Shows on /used-cars/best-used-electric-vehicles and any /best-used/ page whose
   window.BS_PREFILTER.powertrain includes EV/BEV. Edit TEXT/HREF here; nothing else to change.
   Loaded from the site footer via a jsDelivr pin. */
(function () {
  var TEXT = 'California will pay you up to $3,500 to buy your first EV. Here’s how →';
  var HREF = '/research/myfirstev-eligible-cars';
  function isEvPage() {
    if (location.pathname.replace(/\/$/, '') === '/used-cars/best-used-electric-vehicles') return true;
    var pf = window.BS_PREFILTER && window.BS_PREFILTER.powertrain;
    return Array.isArray(pf) && pf.some(function (v) { return /^(EV|BEV)$/i.test(v); });
  }
  function run() {
    if (!isEvPage() || document.querySelector('.bs-mfev')) return;
    var intro = document.querySelector('.srp-head-section p.srp-intro') || document.querySelector('.srp-head-section .srp-title');
    if (!intro) return;
    var css = document.createElement('style');
    css.textContent = '.bs-mfev{font-family:Montserrat,sans-serif;font-size:14px;line-height:1.45;margin:6px 0 2px;color:#0e1523}' +
      '.bs-mfev a{color:#1a6f4a;font-weight:700;text-decoration:none;border-bottom:2px solid #31b56b}.bs-mfev a:hover{color:#31b56b}';
    document.head.appendChild(css);
    var p = document.createElement('p'); p.className = 'bs-mfev';
    var a = document.createElement('a'); a.href = HREF; a.textContent = TEXT;
    a.addEventListener('click', function () { if (window.gtag) gtag('event', 'mfev_promo_click', { page_path: location.pathname }); });
    p.appendChild(a); intro.insertAdjacentElement('afterend', p);
    if (window.gtag) gtag('event', 'mfev_promo_view', { page_path: location.pathname });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
