/* Bestest 3-day return calculator: California CARS Act (SB 766), used cars, from 2026-10-01.
 * Mounts into any <div id="bst-return-calc"></div> on the page. No data leaves the browser.
 *
 * Rules (Civ. Code 1784.31 / 1784.43):
 * - dealer sale of a used car at $50,000 or less; not motorcycles, off-highway vehicles,
 *   10,000+ lb GVWR, auctions, or a buyout of your own lease
 * - 3 calendar days starting the day after signing, ending at the dealer's close of
 *   business; if the dealer is closed on day 3, it rolls to the next day it's open
 * - void past 400 miles driven since signing
 * - restocking fee: 1.5% of price, min $200, max $600, plus $1/mile over 250 (max $150)
 * Class prefix bstrc- avoids collisions with Webflow and the article styles. */
(function () {
  var MAX_PRICE = 50000, MAX_MILES = 400, FREE_MILES = 250, START = new Date(2026, 9, 1);
  var DAY = 86400000;

  function fee(price, miles) {
    var base = Math.round(Math.min(600, Math.max(200, 0.015 * price)));
    var extra = Math.min(150, Math.max(0, Math.round(miles) - FREE_MILES));
    return { base: base, extra: extra, total: base + extra };
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fmtDay(d) { return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
  function parseDate(v) { var p = (v || '').split('-'); return p.length === 3 ? new Date(+p[0], p[1] - 1, +p[2]) : null; }
  function isoDate(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function today() { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }

  var CSS =
    '.bstrc{font-family:"Montserrat",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;background:#f4f8f5;border:1px solid #d3e8da;border-radius:12px;padding:22px 22px 18px;margin:8px 0 30px;color:#0E1523}' +
    '.bstrc h3{font:800 20px/1.3 "Montserrat",sans-serif;margin:0 0 4px;color:#0E1523}' +
    '.bstrc .bstrc-sub{font-size:14px;line-height:1.5;color:#4b5563;margin:0 0 16px}' +
    '.bstrc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px}' +
    '.bstrc label{display:block;font-size:13px;font-weight:700;margin:0 0 5px;color:#1f2937}' +
    '.bstrc input,.bstrc select{width:100%;box-sizing:border-box;font:500 16px "Montserrat",sans-serif;padding:10px 12px;border:1px solid #c5d3ca;border-radius:8px;background:#fff;color:#0E1523}' +
    '.bstrc input:focus,.bstrc select:focus{outline:2px solid #31b56b;outline-offset:1px}' +
    '.bstrc-closed{margin:14px 0 0;font-size:14px;line-height:1.5}' +
    '.bstrc-closed label{display:inline-flex;align-items:center;gap:8px;font-weight:500;margin:0;cursor:pointer}' +
    '.bstrc-closed input{width:18px;height:18px;padding:0;margin:0;accent-color:#1a6f4a}' +
    '.bstrc-out{margin:16px 0 0;background:#fff;border-radius:10px;padding:16px 18px;border:1px solid #d3e8da}' +
    '.bstrc-out.no{border-color:#f0c9a8;background:#fffaf5}' +
    '.bstrc-verdict{font:800 18px/1.35 "Montserrat",sans-serif;margin:0 0 6px}' +
    '.bstrc-out.yes .bstrc-verdict{color:#155539}.bstrc-out.no .bstrc-verdict{color:#9a3412}' +
    '.bstrc-out p{margin:6px 0 0;font-size:15px;line-height:1.55}' +
    '.bstrc-big{font:800 22px/1.25 "Montserrat",sans-serif;color:#0E1523;margin:8px 0 2px}' +
    '.bstrc-fine{font-size:12.5px!important;color:#6b7280;margin-top:12px!important}' +
    '@media (max-width:600px){.bstrc{padding:18px 16px 14px}.bstrc-grid{grid-template-columns:1fr}}';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }

  function mount(root) {
    if (root.getAttribute('data-ready')) return;
    root.setAttribute('data-ready', '1');
    if (!document.getElementById('bstrc-css')) {
      var s = document.createElement('style'); s.id = 'bstrc-css'; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    var box = el(
      '<div class="bstrc">' +
      '<h3>Can I still return my car?</h3>' +
      '<p class="bstrc-sub">Enter a few details to see your deadline and what returning it would cost. Nothing you type leaves this page.</p>' +
      '<div class="bstrc-grid">' +
        '<div><label for="bstrc-price">Car’s price (before tax and fees)</label><input id="bstrc-price" inputmode="numeric" placeholder="$24,500"></div>' +
        '<div><label for="bstrc-date">Date you signed the contract</label><input id="bstrc-date" type="date"></div>' +
        '<div><label for="bstrc-miles">Miles driven since you signed</label><input id="bstrc-miles" inputmode="numeric" placeholder="120"></div>' +
        '<div><label for="bstrc-seller">Who sold it to you?</label><select id="bstrc-seller">' +
          '<option value="dealer">A car dealer</option><option value="private">A private seller</option><option value="auction">An auction</option><option value="lease">My own lease (buyout)</option></select></div>' +
        '<div><label for="bstrc-type">Type of vehicle</label><select id="bstrc-type">' +
          '<option value="car">Car, SUV, truck or van</option><option value="moto">Motorcycle</option><option value="offroad">Off-road vehicle</option><option value="heavy">Heavy-duty (10,000+ lb rating)</option></select></div>' +
        '<div><label for="bstrc-cond">New or used?</label><select id="bstrc-cond"><option value="used">Used (including certified pre-owned)</option><option value="new">New</option></select></div>' +
      '</div>' +
      '<div class="bstrc-closed" hidden><label><input type="checkbox" id="bstrc-closed"> <span></span></label></div>' +
      '<div class="bstrc-out" hidden aria-live="polite"></div>' +
      '</div>');
    root.appendChild(box);

    var $ = function (id) { return box.querySelector('#' + id); };
    var closedWrap = box.querySelector('.bstrc-closed'), closedText = closedWrap.querySelector('span');
    var out = box.querySelector('.bstrc-out');
    var closedDays = 0; // how many day-3 candidates the user marked as closed
    var lastDay3 = '';
    var tracked = false;

    function num(v) { var n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; }

    function show(ok, html) {
      out.hidden = false;
      out.className = 'bstrc-out ' + (ok ? 'yes' : 'no');
      out.innerHTML = html;
      if (!tracked && typeof window.gtag === 'function') {
        tracked = true;
        try { window.gtag('event', 'return_calc_result', { covered: ok ? 'yes' : 'no' }); } catch (e) {}
      }
    }
    function no(title, body) { closedWrap.hidden = true; show(false, '<p class="bstrc-verdict">' + title + '</p><p>' + body + '</p>'); }

    function update() {
      var price = num($('bstrc-price').value), miles = num($('bstrc-miles').value);
      var signed = parseDate($('bstrc-date').value);
      var seller = $('bstrc-seller').value, type = $('bstrc-type').value, cond = $('bstrc-cond').value;
      if (price == null || !signed) { out.hidden = true; closedWrap.hidden = true; return; }
      if (miles == null) miles = 0;

      if (cond === 'new') return no('New cars aren’t covered.', 'California has no return period for new cars. The 3-day right applies only to used cars.');
      if (seller === 'private') return no('Private sales aren’t covered.', 'The 3-day return applies only when you buy from a licensed dealer.');
      if (seller === 'auction') return no('Auction sales aren’t covered.', 'Cars bought at auction are excluded from the 3-day return.');
      if (seller === 'lease') return no('Lease buyouts aren’t covered.', 'Buying out the car you were already leasing is excluded from the 3-day return.');
      if (type !== 'car') return no('This vehicle type isn’t covered.', 'Motorcycles, off-road vehicles and heavy-duty vehicles rated at 10,000 pounds or more are excluded.');
      if (price > MAX_PRICE) return no('Over $50,000 isn’t covered.', 'The 3-day return applies to used cars priced at $50,000 or less.');
      if (signed < START) return no('Only purchases from October 1, 2026 on.', 'The 3-day return took effect October 1, 2026. Earlier purchases fall under the old rules, where the return option was something you had to buy at signing. Check your paperwork for a “contract cancellation option.”');
      if (signed > today()) return no('That date is in the future.', 'Enter the date you signed the purchase contract.');
      if (miles > MAX_MILES) return no('Over 400 miles, the right is gone.', 'The 3-day return ends once the car has been driven more than 400 miles since you signed.');

      // Deadline: day 3 after signing, rolled forward past any days the dealer is closed.
      var day3 = addDays(signed, 3);
      if (isoDate(day3) !== lastDay3) { lastDay3 = isoDate(day3); closedDays = 0; $('bstrc-closed').checked = false; }
      var deadline = addDays(day3, closedDays);
      closedWrap.hidden = false;
      closedText.textContent = 'The dealership is closed on ' + fmtDay(deadline);

      var left = Math.round((deadline - today()) / DAY);
      if (left < 0) return show(false, '<p class="bstrc-verdict">The window has closed.</p><p>Your last day to return it was ' + fmtDay(deadline) + ', at the dealer’s close of business. ' +
        'You may still have other options if something was misrepresented or the car has a defect.</p>');

      var f = fee(price, miles);
      var when = left === 0 ? 'today' : left === 1 ? 'tomorrow' : 'in ' + left + ' days';
      show(true,
        '<p class="bstrc-verdict">Yes, you can still return it.</p>' +
        '<p class="bstrc-big">By close of business ' + fmtDay(deadline) + '</p>' +
        '<p>That’s ' + when + '. Take the car back to the dealer in person, during business hours, in the same condition.</p>' +
        '<p class="bstrc-big">Restocking fee: ' + money(f.total) + '</p>' +
        '<p>' + (f.extra ? money(f.base) + ' (1.5% of the price, within the $200 to $600 range) plus ' + money(f.extra) + ' for the miles over 250.' :
          'That’s 1.5% of the price, within the $200 to $600 range. ' + (miles > 200 ? 'Driving past 250 miles adds $1 a mile.' : 'It stays there unless you drive more than 250 miles.')) +
        ' It comes out of your refund, which is due within 48 hours.</p>' +
        '<p class="bstrc-fine">An estimate from the rules as written, not legal advice. If the dealer’s cancellation form shows a different deadline or fee, ask them to explain it in writing.</p>');
    }

    $('bstrc-closed').addEventListener('change', function () {
      if (this.checked) { closedDays++; this.checked = false; }
      update();
    });
    ['bstrc-price', 'bstrc-date', 'bstrc-miles', 'bstrc-seller', 'bstrc-type', 'bstrc-cond'].forEach(function (id) {
      $(id).addEventListener('input', update);
      $(id).addEventListener('change', update);
    });
    $('bstrc-date').max = isoDate(today());
  }

  function init() {
    var roots = document.querySelectorAll('#bst-return-calc, .bst-return-calc');
    for (var i = 0; i < roots.length; i++) mount(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
