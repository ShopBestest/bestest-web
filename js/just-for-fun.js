/* just-for-fun.js — "this one's a fun car, not a Bestest car" page.
   Renders into <div id="bst-fun"></div>. Reads ?make=&model= from the URL.
   Used for Fun-segment models routed from the homepage picker.
   Deliberately NO scoring chart — fun cars aren't "worse," they're a different goal.
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
  var label = (make + ' ' + model).trim();
  var nameHTML = label ? '<strong>' + esc(label) + '</strong>' : 'That one';

  var shop = '';
  if (make && model) {
    var mk = slug(make), md = slug(model);
    shop =
      '<div class="bst-fun-shop">' +
        '<p class="bst-fun-shop-h">Go enjoy the ' + esc(model) + '. Here’s where enthusiasts shop and read up:</p>' +
        '<div class="bst-fun-links">' +
          '<a href="https://www.caranddriver.com/' + mk + '/' + md + '/" target="_blank" rel="noopener nofollow">Car and Driver</a>' +
          '<a href="https://www.edmunds.com/' + mk + '/' + md + '/" target="_blank" rel="noopener nofollow">Edmunds</a>' +
          '<a href="https://www.cars.com/research/' + mk + '-' + md + '/" target="_blank" rel="noopener nofollow">Cars.com</a>' +
        '</div>' +
      '</div>';
  }

  MOUNT.innerHTML =
    '<section class="bst-fun">' +
      '<div class="bst-fun-badge">Just for fun</div>' +
      '<h1 class="bst-fun-title">' + nameHTML + ' is a great car — it’s just not what Bestest is for.</h1>' +
      '<p class="bst-fun-lede">Coupes, convertibles, off-roaders and performance cars are bought for different reasons than the daily drivers we curate. ' +
        'The math changes: how they’re driven, what they cost to insure and maintain, how they’re optioned, how a used one was treated. ' +
        'So we leave them out — not because they score poorly, but because choosing one well is a different job than the one we do.</p>' +
      '<div class="bst-fun-split">' +
        '<div class="bst-fun-col">' +
          '<p class="bst-fun-col-h">What Bestest optimizes for</p>' +
          '<ul><li>Reliability you can count on for years</li><li>Resale value that holds up</li><li>Safety and everyday practicality</li><li>A clean, low-mileage, dealer-certified example</li></ul>' +
        '</div>' +
        '<div class="bst-fun-col">' +
          '<p class="bst-fun-col-h">What a fun car is about</p>' +
          '<ul><li>How it makes you feel behind the wheel</li><li>Performance, sound and style</li><li>Track days, weekend drives, the badge</li><li>Trade-offs you happily accept for all that</li></ul>' +
        '</div>' +
      '</div>' +
      shop +
      '<div class="bst-fun-cta"><a class="bst-fun-btn" href="/used-cars">See the cars Bestest does curate →</a></div>' +
    '</section>';

  injectStyles();

  function injectStyles() {
    if (document.getElementById('bst-fun-styles')) return;
    var s = document.createElement('style'); s.id = 'bst-fun-styles';
    s.textContent =
      ".bst-fun{max-width:720px;margin:0 auto;padding:8px 0 48px;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,sans-serif;color:#1a1a1a;}" +
      ".bst-fun-badge{display:inline-block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:" + GREEN + ";background:#e8f3ec;border-radius:20px;padding:5px 12px;margin:0 0 16px;}" +
      ".bst-fun-title{font-size:30px;line-height:1.2;font-weight:700;margin:0 0 14px;}" +
      ".bst-fun-lede{font-size:17px;line-height:1.55;color:#333;margin:0 0 28px;}" +
      ".bst-fun-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 28px;}" +
      ".bst-fun-col{background:#f7f6f2;border-radius:12px;padding:18px 18px 8px;}" +
      ".bst-fun-col-h{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5F5E5A;margin:0 0 10px;}" +
      ".bst-fun-col ul{margin:0;padding:0 0 10px 18px;}" +
      ".bst-fun-col li{font-size:14.5px;line-height:1.5;color:#333;margin:0 0 7px;}" +
      ".bst-fun-shop{margin:0 0 28px;}" +
      ".bst-fun-shop-h{font-size:15px;font-weight:600;margin:0 0 10px;}" +
      ".bst-fun-links{display:flex;gap:10px;flex-wrap:wrap;}" +
      ".bst-fun-links a{font-size:14px;font-weight:600;color:#1a6f4a;text-decoration:none;border:1px solid #cfe3d7;border-radius:20px;padding:7px 14px;transition:background .15s;}" +
      ".bst-fun-links a:hover{background:#e8f3ec;}" +
      ".bst-fun-btn{display:inline-block;background:#1a6f4a;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;}" +
      ".bst-fun-btn:hover{background:#155539;}" +
      "@media(max-width:600px){.bst-fun-title{font-size:24px;}.bst-fun-lede{font-size:16px;}.bst-fun-split{grid-template-columns:1fr;}}";
    document.head.appendChild(s);
  }
})();
