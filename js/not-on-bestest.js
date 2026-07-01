/* not-on-bestest.js — "we don't carry this model" page.
   Renders into <div id="bst-notcarried"></div>. Reads ?make=&model= from the URL.
   Used for Banned / Needs-verification models routed from the homepage picker.
   Self-loads Chart.js (4.4.1) for the all-cars pillar comparison.
   Page should be set to noindex in Webflow; this script also injects a robots meta as backup.
   Embed on the Webflow page, before </body>:
   <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/not-on-bestest.js" defer></script>
*/
(function () {
  var MOUNT = document.getElementById('bst-notcarried');
  if (!MOUNT) return;

  // Belt-and-suspenders noindex (primary control is the Webflow page setting).
  if (!document.querySelector('meta[name="robots"]')) {
    var m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex, follow';
    document.head.appendChild(m);
  }

  var GREEN = '#15A36D';

  // All-cars pillar comparison (new scoring engine, Include vs Exclude; market_signal omitted — empty table-wide).
  var PILLARS = ['Critics', 'Internal', 'Safety', 'Reliability', 'Value'];
  var OTHER   = [89.5, 89.5, 82.8, 85.1, 89.5];

  // Locked standard copy (mirrors the site-wide "Which cars make the cut?" overlay).
  var STANDARD = "Bestest was founded by the former head of reviews and ratings for Kelley Blue Book, who's spent more than 20 years helping shoppers find the good cars and avoid the bad ones. The only cars you'll find on Bestest are the ones also ranked highly by trusted institutions like Consumer Reports, Kelley Blue Book, Car and Driver, and NHTSA, with extra emphasis on reliability and resale value. In addition, every car on Bestest is offered by a manufacturer-certified franchise dealer, and has no more than five model years or 50,000 miles on the clock.";

  function param(k) {
    var v = new URLSearchParams(window.location.search).get(k);
    return v ? v.trim() : '';
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  var make = param('make'), model = param('model');
  var label = (make + ' ' + model).trim();
  var nameHTML = label ? '<strong>' + esc(label) + '</strong>' : 'this vehicle';

  var shop = '';
  if (make && model) {
    var mk = slug(make), md = slug(model);
    shop =
      '<div class="bst-nc-shop">' +
        '<p class="bst-nc-shop-h">Still want to research the ' + esc(model) + '? These are good places to start:</p>' +
        '<div class="bst-nc-links">' +
          '<a href="https://www.edmunds.com/' + mk + '/' + md + '/" target="_blank" rel="noopener nofollow">Edmunds</a>' +
          '<a href="https://www.kbb.com/' + mk + '/' + md + '/" target="_blank" rel="noopener nofollow">Kelley Blue Book</a>' +
          '<a href="https://www.cars.com/research/' + mk + '-' + md + '/" target="_blank" rel="noopener nofollow">Cars.com</a>' +
        '</div>' +
      '</div>';
  }

  MOUNT.innerHTML =
    '<section class="bst-nc">' +
      '<h1 class="bst-nc-title">Sorry — ' + nameHTML + ' didn’t make the cut.</h1>' +
      '<p class="bst-nc-lede">It isn’t on Bestest, which means it didn’t clear our bar on the things that matter most to everyday buyers. ' +
        'That doesn’t make it a bad car everywhere — just one we’d tell you to do a little more homework on.</p>' +
      '<div class="bst-nc-chartwrap">' +
        '<p class="bst-nc-chart-h">How the cars we don’t list tend to score</p>' +
        '<div class="bst-nc-chart"><canvas id="bstNotCarriedChart" role="img" ' +
          'aria-label="Bestest-approved cars hold a 100 percent baseline across five scoring pillars; cars Bestest does not list score consistently lower, from about 83 to 90 percent.">' +
          'Bestest-approved cars hold the 100 percent baseline across all five pillars. The cars we don’t list score consistently lower — roughly 83–90 percent — across reliability, value retention, safety, critical reception and our own testing.' +
        '</canvas></div>' +
        '<p class="bst-nc-chart-cap">Across every pillar we score, the cars we leave out land below our approved set — with the biggest gaps on the reliability and resale value we weight most heavily.</p>' +
      '</div>' +
      '<p class="bst-nc-standard">' + esc(STANDARD) + '</p>' +
      shop +
      '<div class="bst-nc-cta"><a class="bst-nc-btn" href="/used-cars">Browse the cars that did make the cut →</a></div>' +
    '</section>';

  injectStyles();
  loadChart(renderChart);

  function renderChart() {
    var canvas = document.getElementById('bstNotCarriedChart');
    if (!canvas || typeof Chart === 'undefined') return;
    var labelPlugin = {
      id: 'ncInlineLabels',
      afterDatasetsDraw: function (chart) {
        var ctx = chart.ctx, sc = chart.scales;
        var fs = chart.width < 480 ? 12 : 13;
        ctx.save();
        ctx.font = '500 ' + fs + "px Montserrat, system-ui, sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = GREEN; ctx.textBaseline = 'bottom';
        ctx.fillText('Bestest-approved', sc.x.getPixelForValue(2), sc.y.getPixelForValue(100) - 8);
        ctx.fillStyle = '#5F5E5A'; ctx.textBaseline = 'top';
        ctx.fillText('Cars we don’t list', sc.x.getPixelForValue(2), sc.y.getPixelForValue(82.8) + 12);
        ctx.restore();
      }
    };
    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: PILLARS,
        datasets: [
          { label: 'Bestest-approved', data: [100, 100, 100, 100, 100], borderColor: GREEN, borderWidth: 4, pointRadius: 0, fill: false, tension: 0, order: 1 },
          { label: 'Cars we don’t list', data: OTHER, borderColor: '#5F5E5A', backgroundColor: 'rgba(95,94,90,0.13)', borderWidth: 2, pointRadius: 0, fill: '-1', tension: 0, order: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 28, bottom: 4, left: 4, right: 4 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          y: {
            min: 50, max: 105,
            ticks: { font: { size: 11, family: 'Montserrat, system-ui, sans-serif' }, color: '#888780',
              callback: function (v) { return (v === 50 || v === 100) ? v + '%' : ''; } },
            afterBuildTicks: function (a) { a.ticks = a.ticks.filter(function (t) { return t.value === 50 || t.value === 100; }); },
            grid: { color: function (c) { return c.tick.value === 100 ? 'rgba(21,163,109,0.4)' : 'rgba(180,178,169,0.18)'; },
              lineWidth: function (c) { return c.tick.value === 100 ? 1.5 : 1; } },
            border: { display: false }
          },
          x: {
            ticks: { font: { size: 12, family: 'Montserrat, system-ui, sans-serif' }, color: '#444441', autoSkip: false, maxRotation: 0 },
            grid: { display: false }, border: { color: 'rgba(180,178,169,0.4)' }
          }
        }
      },
      plugins: [labelPlugin]
    });
  }

  function loadChart(cb) {
    if (typeof Chart !== 'undefined') { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = cb;
    s.onerror = function () { /* chart is enhancement-only; text fallback stays */ };
    document.head.appendChild(s);
  }

  function injectStyles() {
    if (document.getElementById('bst-nc-styles')) return;
    var s = document.createElement('style'); s.id = 'bst-nc-styles';
    s.textContent =
      ".bst-nc{max-width:720px;margin:0 auto;padding:8px 0 48px;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,sans-serif;color:#1a1a1a;}" +
      ".bst-nc-title{font-size:30px;line-height:1.2;font-weight:700;margin:0 0 14px;}" +
      ".bst-nc-lede{font-size:17px;line-height:1.55;color:#333;margin:0 0 28px;}" +
      ".bst-nc-chartwrap{background:#f0f7f2;border-radius:12px;padding:20px 18px 16px;margin:0 0 28px;}" +
      ".bst-nc-chart-h{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#5F5E5A;margin:0 0 6px;}" +
      ".bst-nc-chart{position:relative;height:230px;}" +
      ".bst-nc-chart-cap{font-size:13px;line-height:1.5;color:#5F5E5A;margin:12px 2px 0;}" +
      ".bst-nc-standard{font-size:14px;line-height:1.65;color:#444;border-left:3px solid " + GREEN + ";padding:2px 0 2px 16px;margin:0 0 28px;}" +
      ".bst-nc-shop{margin:0 0 28px;}" +
      ".bst-nc-shop-h{font-size:15px;font-weight:600;margin:0 0 10px;}" +
      ".bst-nc-links{display:flex;gap:10px;flex-wrap:wrap;}" +
      ".bst-nc-links a{font-size:14px;font-weight:600;color:#1a6f4a;text-decoration:none;border:1px solid #cfe3d7;border-radius:20px;padding:7px 14px;transition:background .15s;}" +
      ".bst-nc-links a:hover{background:#e8f3ec;}" +
      ".bst-nc-cta{margin-top:8px;}" +
      ".bst-nc-btn{display:inline-block;background:#1a6f4a;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;}" +
      ".bst-nc-btn:hover{background:#155539;}" +
      "@media(max-width:600px){.bst-nc-title{font-size:24px;}.bst-nc-lede{font-size:16px;}.bst-nc-chart{height:200px;}}";
    document.head.appendChild(s);
  }
})();
