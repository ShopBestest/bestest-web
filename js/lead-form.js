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
  var CONSENT_TEXT = 'By clicking Check availability, I agree to share my info with this dealer and ' +
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

  function injectStyles() {
    if (document.getElementById('bstlf-styles')) return;
    var s = document.createElement('style');
    s.id = 'bstlf-styles';
    s.textContent =
      ".bstlf-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100000;display:none;align-items:center;justify-content:center;padding:16px;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;}" +
      ".bstlf-backdrop.bstlf-open{display:flex;}" +
      ".bstlf-card{position:relative;background:#fff;border-radius:14px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;padding:24px 22px;box-shadow:0 16px 48px rgba(0,0,0,.2);box-sizing:border-box;}" +
      ".bstlf-close{position:absolute;top:8px;right:12px;width:30px;height:30px;border:none;background:transparent;color:#999;font-size:22px;line-height:1;cursor:pointer;padding:0;}" +
      ".bstlf-title{font-size:18px;font-weight:700;color:#0e1523;margin:0 6px 4px 0;line-height:1.3;}" +
      ".bstlf-sub{font-size:13px;color:#666;margin:0 0 16px;line-height:1.45;}" +
      ".bstlf-field{margin-bottom:10px;}" +
      ".bstlf-input{width:100%;padding:10px 12px;border:1px solid #d0d0d0;border-radius:8px;font-size:15px;font-family:inherit;color:#1a1a1a;box-sizing:border-box;outline:none;transition:border-color .15s;}" +
      ".bstlf-input:focus{border-color:#1a6f4a;}" +
      ".bstlf-input.bstlf-err{border-color:#c0392b;}" +
      "textarea.bstlf-input{min-height:64px;resize:vertical;}" +
      ".bstlf-more-toggle{background:none;border:none;color:#1a6f4a;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:2px 0;margin:2px 0 8px;}" +
      ".bstlf-more{display:none;}" +
      ".bstlf-more.bstlf-show{display:block;}" +
      ".bstlf-check{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:#333;line-height:1.4;margin:8px 0;cursor:pointer;}" +
      ".bstlf-check input{margin-top:2px;flex-shrink:0;width:16px;height:16px;accent-color:#1a6f4a;}" +
      ".bstlf-consent{font-size:11px;color:#777;line-height:1.45;margin:10px 0 0;}" +
      ".bstlf-consent a{color:#1a6f4a;text-decoration:underline;}" +
      ".bstlf-submit{width:100%;margin-top:12px;padding:13px;background:#1a6f4a;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:background .15s;}" +
      ".bstlf-submit:hover{background:#155539;}" +
      ".bstlf-submit:disabled{opacity:.6;cursor:default;}" +
      ".bstlf-err-msg{color:#c0392b;font-size:12px;min-height:15px;margin-top:6px;}" +
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
          '<p class="bstlf-sub bstlf-veh"></p>' +
          '<form class="bstlf-form" novalidate>' +
            '<input class="bstlf-hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<div class="bstlf-field"><input class="bstlf-input bstlf-name" type="text" placeholder="Full name" aria-label="Full name" autocomplete="name"></div>' +
            '<div class="bstlf-field"><input class="bstlf-input bstlf-email" type="email" placeholder="Email" aria-label="Email" autocomplete="email" inputmode="email"></div>' +
            '<div class="bstlf-field"><input class="bstlf-input bstlf-phone" type="tel" placeholder="Phone" aria-label="Phone" autocomplete="tel" inputmode="tel"></div>' +
            '<button type="button" class="bstlf-more-toggle">+ Add a message, financing or trade-in</button>' +
            '<div class="bstlf-more">' +
              '<div class="bstlf-field"><textarea class="bstlf-input bstlf-message" aria-label="Message to the dealer" placeholder="Anything you’d like the dealer to know? (optional)"></textarea></div>' +
              '<label class="bstlf-check"><input type="checkbox" class="bstlf-financing"> I’m interested in financing</label>' +
              '<label class="bstlf-check"><input type="checkbox" class="bstlf-tradein"> I have a trade-in</label>' +
            '</div>' +
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
    backdrop.querySelector('.bstlf-more-toggle').addEventListener('click', function () {
      backdrop.querySelector('.bstlf-more').classList.toggle('bstlf-show');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('bstlf-open')) close();
    });

    function val(sel) { return (backdrop.querySelector(sel).value || '').trim(); }
    function flagErr(sel, bad) { backdrop.querySelector(sel).classList.toggle('bstlf-err', !!bad); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errMsg.textContent = '';
      var name = val('.bstlf-name'), email = val('.bstlf-email'), phone = val('.bstlf-phone');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var phoneOk = phone.replace(/\D/g, '').length >= 10;
      flagErr('.bstlf-name', !name); flagErr('.bstlf-email', !emailOk); flagErr('.bstlf-phone', !phoneOk);
      if (!name || !emailOk || !phoneOk) { errMsg.textContent = 'Please enter your name, a valid email, and phone.'; return; }
      // By-clicking consent: submitting the form IS the agreement (disclosure shown above).

      submit.disabled = true; submit.textContent = 'Sending…';
      var payload = {
        name: name, email: email, phone: phone,
        message: val('.bstlf-message'),
        financing_interest: backdrop.querySelector('.bstlf-financing').checked,
        trade_in: backdrop.querySelector('.bstlf-tradein').checked,
        consent: true, consent_text: CONSENT_TEXT,
        company: val('.bstlf-hp'),
        elapsed_ms: Date.now() - openedAt,
        vehicle_title: ctx.title, vin: ctx.vin, price: ctx.price,
        dealer_name: ctx.dealer, dealer_listing_url: ctx.dealerUrl, vdp_url: location.href
      };
      fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && res.ok) {
            backdrop.querySelector('.bstlf-form-wrap').style.display = 'none';
            backdrop.querySelector('.bstlf-done').style.display = 'block';
          } else { throw new Error((res && res.error) || 'failed'); }
        })
        .catch(function () {
          submit.disabled = false; submit.textContent = 'Check availability';
          errMsg.textContent = 'Something went wrong sending that. Please try again, or call the dealer.';
        });
    });
  }

  function open(url, e) {
    if (e) { e.preventDefault(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
    build();
    var v = vehicle();
    ctx = { title: v.title, vin: v.vin, price: v.price, dealer: v.dealer, dealerUrl: url };
    // reset to a fresh form each open
    backdrop.querySelector('.bstlf-form-wrap').style.display = 'block';
    backdrop.querySelector('.bstlf-done').style.display = 'none';
    backdrop.querySelector('.bstlf-form').reset();
    backdrop.querySelector('.bstlf-more').classList.remove('bstlf-show');
    backdrop.querySelector('.bstlf-err-msg').textContent = '';
    var sub = backdrop.querySelector('.bstlf-submit'); sub.disabled = false; sub.textContent = 'Check availability';
    var vehLine = v.title + (v.dealer ? ' · ' + v.dealer : '');
    backdrop.querySelector('.bstlf-veh').textContent = vehLine;
    openedAt = Date.now();
    backdrop.classList.add('bstlf-open');
    setTimeout(function () { var n = backdrop.querySelector('.bstlf-name'); if (n) n.focus(); }, 60);
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.BestestLeadForm = { open: function () { open(dealerUrl()); }, close: close };
})();
