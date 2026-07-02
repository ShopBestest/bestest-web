/* just-for-fun.js — "this one's a fun car, not a Bestest car" page (/fun-cars).
   Renders into <div id="bst-fun"></div>. Reads ?make=&model= from the URL.
   Used for Fun-segment models routed from the homepage picker.
   Deliberately NO scoring chart — fun cars aren't "worse," they're a different goal.
   Each column carries its own CTA: the Bestest column -> the SRP; the fun column ->
   used listings for that model on Autotrader (new tab, external-link icon).
   Page should be set to noindex in Webflow; this script also injects a robots meta as backup.
   Embed on the Webflow page, before </body>:
   <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/just-for-fun.js" defer></script>
*/
(function () {
  var MOUNT = document.getElementById('bst-fun');
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
  var nameHTML = name ? esc(name) : 'This one';
  // Autotrader resolves simple {make}/{model} slugs (verified), so no mapping needed.
  var autotrader = (make && model)
    ? 'https://www.autotrader.com/cars-for-sale/' + slug(make) + '/' + slug(model)
    : 'https://www.autotrader.com/cars-for-sale/all-cars';

  // Feather "external-link" icon — signals the Autotrader link opens off-site / new tab.
  var EXT = '<svg class="bst-fun-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

  MOUNT.innerHTML =
    '<section class="bst-fun">' +
      '<div class="bst-fun-badge">Just for fun</div>' +
      '<h1 class="bst-fun-title">The <strong>' + nameHTML + '</strong> is too much fun for Bestest.</h1>' +
      '<p class="bst-fun-lede">Coupes, convertibles, off-roaders and performance cars get bought for reasons a daily driver never has to answer to — how it corners, how it sounds, how it looks in the driveway on a Saturday. That’s a great reason to buy a car. It’s just not the one Bestest is built around.</p>' +
      '<p class="bst-fun-lede">The homework’s different, too: how a used one was actually driven and maintained, what it’ll cost to insure, which options are worth paying for, how values hold on a car bought with the heart. We leave those calls to the enthusiasts and specialists who love making them — and keep our focus on the most reliable, best-value everyday cars, the ones we can stand behind.</p>' +
      '<div class="bst-fun-split">' +
        '<div class="bst-fun-col">' +
          '<p class="bst-fun-col-h">What a fun car is about</p>' +
          '<ul><li>How it makes you feel behind the wheel</li><li>Performance, sound and style</li><li>Track days, weekend drives, the badge</li><li>Trade-offs you happily accept for all that</li></ul>' +
          '<a class="bst-fun-cta bst-fun-cta-out" href="' + autotrader + '" target="_blank" rel="noopener nofollow">' +
            '<span>Shop used ' + nameHTML + ' on Autotrader</span>' + EXT +
          '</a>' +
        '</div>' +
        '<div class="bst-fun-col">' +
          '<p class="bst-fun-col-h">What Bestest optimizes for</p>' +
          '<ul><li>Reliability you can count on for years</li><li>Resale value that holds up</li><li>Safety and everyday practicality</li><li>A clean, low-mileage, dealer-certified example</li></ul>' +
          '<a class="bst-fun-cta bst-fun-cta-primary" href="/used-cars">Shop the best everyday cars on Bestest →</a>' +
        '</div>' +
      '</div>' +
    '</section>';

  injectStyles();

  function injectStyles() {
    if (document.getElementById('bst-fun-styles')) return;
    var s = document.createElement('style'); s.id = 'bst-fun-styles';
    s.textContent =
      // Force Montserrat on everything in this block, regardless of page defaults.
      ".bst-fun, .bst-fun * { font-family: 'Montserrat', sans-serif !important; }" +
      ".bst-fun{max-width:720px;margin:0 auto;padding:8px 0 48px;color:#1a1a1a;}" +
      ".bst-fun-badge{display:inline-block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:" + GREEN + ";background:#e8f3ec;border-radius:20px;padding:5px 12px;margin:0 0 16px;}" +
      ".bst-fun-title{font-size:30px;line-height:1.2;font-weight:700;margin:0 0 14px;}" +
      ".bst-fun-lede{font-size:17px;line-height:1.55;color:#333;margin:0 0 18px;}" +
      ".bst-fun-lede:last-of-type{margin-bottom:28px;}" +
      ".bst-fun-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 8px;}" +
      ".bst-fun-col{background:#f7f6f2;border-radius:12px;padding:18px 18px 18px;display:flex;flex-direction:column;}" +
      ".bst-fun-col-h{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5F5E5A;margin:0 0 10px;}" +
      ".bst-fun-col ul{margin:0 0 16px;padding:0 0 0 18px;}" +
      ".bst-fun-col li{font-size:14.5px;line-height:1.5;color:#333;margin:0 0 7px;}" +
      ".bst-fun-cta{margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:7px;text-align:center;font-size:14px;font-weight:600;text-decoration:none;padding:11px 16px;border-radius:10px;line-height:1.3;}" +
      ".bst-fun-cta-primary{background:#1a6f4a;color:#fff;}" +
      ".bst-fun-cta-primary:hover{background:#155539;}" +
      ".bst-fun-cta-out{background:#fff;color:#1a6f4a;border:1px solid #cfe3d7;}" +
      ".bst-fun-cta-out:hover{background:#e8f3ec;}" +
      ".bst-fun-ext{width:15px;height:15px;flex-shrink:0;}" +
      "@media(max-width:600px){.bst-fun-title{font-size:24px;}.bst-fun-lede{font-size:16px;}.bst-fun-split{grid-template-columns:1fr;}}";
    document.head.appendChild(s);
  }
})();
