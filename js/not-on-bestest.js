/* not-on-bestest.js — "this model isn't on Bestest" page (/not-bestest).
   Renders into <div id="bst-notcarried"></div>. Reads ?make=&model= from the URL.
   Used for Banned / Needs-verification models routed from the homepage picker.
   Two-box checkbox comparison (this car vs Bestest cars); each box carries its own CTA:
   this-car box -> used listings on Autotrader (new tab); Bestest box -> the SRP.
   Page should be set to noindex in Webflow; this script also injects a robots meta as backup.
   Embed on the Webflow page, before </body>:
   <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/not-on-bestest.js" defer></script>
*/
(function () {
  var MOUNT = document.getElementById('bst-notcarried');
  if (!MOUNT) return;

  if (!document.querySelector('meta[name="robots"]')) {
    var m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex, follow';
    document.head.appendChild(m);
  }

  var GREEN = '#15A36D';

  function param(k) {
    var v = new URLSearchParams(window.location.search).get(k);
    return v ? v.trim() : '';
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  var make = param('make'), model = param('model');
  var name = (make + ' ' + model).trim();
  var nameHTML = name ? esc(name) : 'This car';
  var autotrader = (make && model)
    ? 'https://www.autotrader.com/cars-for-sale/' + slug(make) + '/' + slug(model)
    : 'https://www.autotrader.com/cars-for-sale/all-cars';

  var EXT = '<svg class="bst-nc-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  // Same three criteria in both columns — checked for Bestest, unchecked for this car.
  var CRITERIA = [
    'Ranked among the best by Consumer Reports, KBB, Car and Driver & NHTSA',
    'Strong on the reliability and resale value we weight most heavily',
    'Vetted and recommended by Bestest'
  ];
  function checkRows(on) {
    return CRITERIA.map(function (c) {
      var box = on
        ? '<span class="bst-chk bst-chk-on">' + CHECK + '</span>'
        : '<span class="bst-chk bst-chk-off"></span>';
      return '<li' + (on ? '' : ' class="bst-off-row"') + '>' + box + '<span>' + c + '</span></li>';
    }).join('');
  }

  MOUNT.innerHTML =
    '<section class="bst-nc">' +
      '<h1 class="bst-nc-title">The <strong>' + nameHTML + '</strong> isn’t Bestest material.</h1>' +
      '<p class="bst-nc-lede">Which isn’t the same as saying it’s a bad car — plenty of the cars we leave off are perfectly good, and the ' + esc(model || 'this one') + ' may well be one of them. It just didn’t clear the bar we hold for reliability and resale value, the traits that make a used car easy to stand behind. So it’s not as easy for us to recommend as the cars on Bestest. Here’s the difference:</p>' +
      '<div class="bst-nc-split">' +
        '<div class="bst-nc-col bst-nc-col-model">' +
          '<p class="bst-nc-col-h">The ' + nameHTML + '</p>' +
          '<ul class="bst-nc-checks">' + checkRows(false) + '</ul>' +
          '<a class="bst-nc-cta bst-nc-cta-out" href="' + autotrader + '" target="_blank" rel="noopener nofollow">' +
            '<span>Shop used ' + nameHTML + ' on Autotrader</span>' + EXT +
          '</a>' +
        '</div>' +
        '<div class="bst-nc-col bst-nc-col-best">' +
          '<p class="bst-nc-col-h">Bestest cars</p>' +
          '<ul class="bst-nc-checks">' + checkRows(true) + '</ul>' +
          '<a class="bst-nc-cta bst-nc-cta-primary" href="/used-cars">Shop the best everyday cars on Bestest →</a>' +
        '</div>' +
      '</div>' +
    '</section>';

  injectStyles();

  function injectStyles() {
    if (document.getElementById('bst-nc-styles')) return;
    var s = document.createElement('style'); s.id = 'bst-nc-styles';
    s.textContent =
      ".bst-nc, .bst-nc * { font-family: 'Montserrat', sans-serif !important; }" +
      ".bst-nc{max-width:720px;margin:0 auto;padding:8px 0 48px;color:#1a1a1a;}" +
      ".bst-nc-title{font-size:30px;line-height:1.2;font-weight:700;margin:0 0 14px;}" +
      ".bst-nc-lede{font-size:17px;line-height:1.55;color:#333;margin:0 0 28px;}" +
      ".bst-nc-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;}" +
      ".bst-nc-col{border-radius:12px;padding:18px;display:flex;flex-direction:column;}" +
      ".bst-nc-col-model{background:#f7f6f2;}" +
      ".bst-nc-col-best{background:#f0f7f2;}" +
      ".bst-nc-col-h{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5F5E5A;margin:0 0 14px;}" +
      ".bst-nc-col-best .bst-nc-col-h{color:" + GREEN + ";}" +
      ".bst-nc-checks{list-style:none;margin:0 0 16px;padding:0;}" +
      ".bst-nc-checks li{display:flex;align-items:flex-start;gap:10px;font-size:14.5px;line-height:1.4;color:#333;margin:0 0 12px;}" +
      ".bst-nc-checks li.bst-off-row{color:#9a988f;}" +
      ".bst-chk{flex-shrink:0;width:20px;height:20px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;margin-top:1px;}" +
      ".bst-chk-on{background:" + GREEN + ";color:#fff;}" +
      ".bst-chk-on svg{width:13px;height:13px;}" +
      ".bst-chk-off{background:#fff;border:1.5px solid #d8d6cc;}" +
      ".bst-nc-cta{margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:7px;text-align:center;font-size:14px;font-weight:600;text-decoration:none;padding:11px 16px;border-radius:10px;line-height:1.3;}" +
      ".bst-nc-cta-primary{background:#1a6f4a;color:#fff;}" +
      ".bst-nc-cta-primary:hover{background:#155539;}" +
      ".bst-nc-cta-out{background:#fff;color:#1a6f4a;border:1px solid #cfe3d7;}" +
      ".bst-nc-cta-out:hover{background:#e8f3ec;}" +
      ".bst-nc-ext{width:15px;height:15px;flex-shrink:0;}" +
      "@media(max-width:600px){.bst-nc-title{font-size:24px;}.bst-nc-lede{font-size:16px;}.bst-nc-split{grid-template-columns:1fr;}}";
    document.head.appendChild(s);
  }
})();
