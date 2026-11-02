/* Bestest VDP "Also at / also nearby" row (2026-11-01). Progressive enhancement over a server-rendered element.

   Contract (the VDP template renders this from CMS fields; see embeds/vdp-nearby-row.html):
     <div data-bst-nearby data-center-slug="tustin-auto-center" data-center-name="Tustin Auto Center"
          data-dealer="Tustin Toyota" data-city="Tustin" data-segment="Compact SUV" data-slug="2023-toyota-rav4-xle-123456"
          data-cars="slug-a,slug-b">                       <- optional: an explicit list wins over the derivation below
       <p class="bst-nr-text">Also at the Tustin Auto Center: ... <a class="bst-nr-link" href="/auto-centers/tustin-auto-center">See them all</a></p>
     </div>
   With no JS the sentence and link still show. This script adds 5-8 small car cards under the sentence from the
   public inventory feed, using the same tiers as auto_centers.py (pipeline): 1 same segment at the center -> 2 any car
   at the center -> 3 same segment in the dealer's city -> 4 any car in the city -> 5 same segment within 3/6/10 miles
   of the dealer. It needs at least 5 cards or it adds nothing.
   It also adds containedInPlace (the auto center as a schema.org Place) to the page's Car offers.seller, if the page
   already carries Car JSON-LD and the car sits at a center. Nothing else on the page is touched.

   Data: the feed (window.BS_FEED_URL or the production feed Worker) and data/auto-centers.json from the same jsDelivr
   pin this file is served from (override with window.BS_AUTO_CENTERS_URL). Exported by
   `python3 auto_centers.py --export` in bestest-pipeline. */
(function () {
  if (window.__bstNearbyRow) return;
  window.__bstNearbyRow = true;

  var FEED_URL = (typeof window.BS_FEED_URL === 'string' && window.BS_FEED_URL) || 'https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/';
  var MIN_CARDS = 5, MAX_CARDS = 8, RADII = [3, 6, 10];
  var SITE = 'https://shopbestest.com';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

  function centersUrl() {
    if (typeof window.BS_AUTO_CENTERS_URL === 'string' && window.BS_AUTO_CENTERS_URL) return window.BS_AUTO_CENTERS_URL;
    var me = document.currentScript && document.currentScript.src;
    if (!me) {
      var s = document.querySelector('script[src*="nearby-row.js"]');
      me = s && s.src;
    }
    return me ? me.replace(/js\/nearby-row\.js.*$/, 'data/auto-centers.json') : null;
  }

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function num(v) { var n = typeof v === 'number' ? v : parseFloat(v); return isNaN(n) ? null : n; }
  function miles(lat1, lng1, lat2, lng2) {
    var R = 3958.8, toRad = function (x) { return x * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function coords(c) { var la = num(c.la), ln = num(c.ln); return la != null && ln != null && !(la === 0 && ln === 0) ? { lat: la, lng: ln } : null; }
  function fmtPrice(n) { n = num(n); return n > 0 ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : ''; }
  function fmtMiles(n) { n = num(n); return n > 0 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' mi' : ''; }
  function fresh(c) { return c.pm ? (new Date(c.pm).getTime() || 0) : 0; }
  function rich(c) { return (num(c.pho) || 0) >= 15 ? 1 : 0; }
  // the feed's own default order: photo-rich first, then freshest photos
  function byDefault(a, b) { return (rich(b) - rich(a)) || (fresh(b) - fresh(a)); }

  function getJSON(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function feedList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.cars)) return data.cars;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  }

  /* Same tiers as auto_centers.row_for. Returns {tier, cars} or null. */
  function pick(me, ctx, feed, center) {
    var others = feed.filter(function (c) { return c.slug && c.slug !== ctx.slug; });
    var seg = ctx.segment;
    if (center) {
      var dealers = {};
      (center.dealers || []).forEach(function (d) { dealers[d] = true; });
      var atCenter = others.filter(function (c) { return dealers[c.dn]; });
      var sameSeg = seg ? atCenter.filter(function (c) { return c.sg === seg; }) : [];
      if (sameSeg.length >= MIN_CARDS) return { tier: 1, cars: sameSeg.sort(byDefault) };
      if (atCenter.length >= MIN_CARDS) {
        var rest = atCenter.filter(function (c) { return c.sg !== seg; }).sort(byDefault);
        return { tier: 2, cars: sameSeg.sort(byDefault).concat(rest) };
      }
    }
    if (ctx.city) {
      // city tiers need a second dealer in the pool (a dealer alone in its city falls through to the radius search)
      var inCity = others.filter(function (c) { return c.dc === ctx.city; });
      var cityScore = seg ? inCity.filter(function (c) { return c.sg === seg; }) : [];
      if (cityScore.length >= MIN_CARDS && dealersIn(cityScore) >= 2) return { tier: 3, cars: cityScore.sort(byDefault) };
      if (inCity.length >= MIN_CARDS && dealersIn(inCity) >= 2) {
        var cityRest = inCity.filter(function (c) { return c.sg !== seg; }).sort(byDefault);
        return { tier: 4, cars: cityScore.sort(byDefault).concat(cityRest) };
      }
    }
    var origin = (me && coords(me)) || dealerCoords(ctx.dealer, feed) || (center && num(center.lat) != null ? { lat: num(center.lat), lng: num(center.lng) } : null);
    if (!origin || !seg) return null;
    for (var i = 0; i < RADII.length; i++) {
      var r = RADII[i];
      var near = others.filter(function (c) { var p = coords(c); return c.sg === seg && p && miles(origin.lat, origin.lng, p.lat, p.lng) <= r; });
      if (near.length >= MIN_CARDS) {
        near.forEach(function (c) { var p = coords(c); c._d = miles(origin.lat, origin.lng, p.lat, p.lng); });
        near.sort(function (a, b) { return a._d - b._d; });
        return { tier: 5, cars: near };
      }
    }
    return null;
  }
  function dealersIn(list) { var seen = {}, n = 0; list.forEach(function (c) { if (c.dn && !seen[c.dn]) { seen[c.dn] = true; n++; } }); return n; }
  function dealerCoords(dn, feed) {
    for (var i = 0; i < feed.length; i++) if (feed[i].dn === dn && coords(feed[i])) return coords(feed[i]);
    return null;
  }

  function cardHTML(c, tier, center) {
    var img = c.img ? String(c.img).replace(/w_\d+/, 'w_480') : '';
    var title = c.t || [c.y, c.mk, c.md, c.tr].filter(Boolean).join(' ');
    return '<a class="bst-nr-card" href="/used/' + esc(c.slug) + '" data-bst-track="nearby_card" data-bst-tier="' + tier + '"'
      + (center ? ' data-bst-center="' + esc(center.slug) + '"' : '') + '>'
      + (img ? '<img class="bst-nr-img" src="' + esc(img) + '" alt="' + esc(title) + '" loading="lazy" width="480" height="360">' : '<div class="bst-nr-img"></div>')
      + '<div class="bst-nr-body">'
      + '<div class="bst-nr-check">' + CHECK + ' Bestest-approved</div>'
      + '<div class="bst-nr-name">' + esc(title) + '</div>'
      + '<div class="bst-nr-dealer">' + esc(c.dn || '') + (tier === 5 && c._d != null && c._d >= 0.1 ? ' · ' + (c._d < 1.5 ? '1 mi' : Math.round(c._d) + ' mi') : '') + '</div>'
      + '<div class="bst-nr-meta">' + esc(fmtMiles(c.mi)) + '</div>'
      + '<div class="bst-nr-price">' + esc(fmtPrice(c.p)) + '</div>'
      + '</div></a>';
  }

  /* Additive schema: the car's seller sits in the auto center (same Place @id as the hub page). */
  function addContainedInPlace(center) {
    if (!center) return;
    var url = SITE + '/auto-centers/' + center.slug;
    var place = { '@type': 'Place', '@id': url + '#place', name: center.name, url: url };
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var d = JSON.parse(scripts[i].textContent);
        var nodes = d['@graph'] ? d['@graph'] : [d];
        var changed = false;
        nodes.forEach(function (n) {
          if (!/Car|Vehicle/.test(n['@type'] || '')) return;
          var offers = Array.isArray(n.offers) ? n.offers : (n.offers ? [n.offers] : []);
          offers.forEach(function (o) {
            if (o && o.seller && typeof o.seller === 'object' && !o.seller.containedInPlace) { o.seller.containedInPlace = place; changed = true; }
          });
        });
        if (changed) { scripts[i].textContent = JSON.stringify(d); return; }
      } catch (e) { /* not ours; leave it */ }
    }
  }

  function track(name, params) { if (typeof gtag === 'function') { try { gtag('event', name, params || {}); } catch (e) {} } }

  onReady(function () {
    var el = document.querySelector('[data-bst-nearby]');
    if (!el) return;
    var textEl = el.querySelector('.bst-nr-text') || el;
    if (!(textEl.textContent || '').trim()) { el.classList.add('bst-nr-empty'); return; }
    var ctx = {
      centerSlug: el.getAttribute('data-center-slug') || '',
      dealer: el.getAttribute('data-dealer') || '',
      city: el.getAttribute('data-city') || '',
      segment: el.getAttribute('data-segment') || '',
      slug: el.getAttribute('data-slug') || (window.location.pathname.split('/').filter(Boolean).pop() || ''),
      cars: (el.getAttribute('data-cars') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean)
    };
    var cu = centersUrl();
    Promise.all([getJSON(FEED_URL).then(feedList), cu ? getJSON(cu).catch(function () { return null; }) : Promise.resolve(null)])
      .then(function (res) {
        var feed = res[0], centersDoc = res[1];
        var centers = (centersDoc && centersDoc.centers) || [];
        var center = null;
        for (var i = 0; i < centers.length; i++) if (centers[i].slug === ctx.centerSlug) { center = centers[i]; break; }
        if (!center && ctx.centerSlug && ctx.dealer) {
          // data file not reachable: the center's dealers are unknown, so only the explicit list or tier 3 can run
          center = null;
        }
        var me = null;
        for (var j = 0; j < feed.length; j++) if (feed[j].slug === ctx.slug) { me = feed[j]; break; }
        if (me) { ctx.segment = ctx.segment || me.sg || ''; ctx.dealer = ctx.dealer || me.dn || ''; ctx.city = ctx.city || me.dc || ''; }
        addContainedInPlace(center);

        var chosen;
        if (ctx.cars.length) {
          var bySlug = {};
          feed.forEach(function (c) { bySlug[c.slug] = c; });
          chosen = { tier: 0, cars: ctx.cars.map(function (s) { return bySlug[s]; }).filter(Boolean) };
        } else {
          chosen = pick(me, ctx, feed, center);
        }
        if (!chosen || chosen.cars.length < MIN_CARDS) { el.classList.add('bst-nr-nocards'); return; }
        var cards = chosen.cars.slice(0, MAX_CARDS);
        var row = document.createElement('div');
        row.className = 'bst-nr-cards';
        row.setAttribute('data-bst-tier', String(chosen.tier));
        row.innerHTML = cards.map(function (c) { return cardHTML(c, chosen.tier, center); }).join('');
        textEl.insertAdjacentElement('afterend', row);
        el.classList.add('bst-nr-ready');
        row.addEventListener('click', function (e) {
          var a = e.target.closest && e.target.closest('.bst-nr-card');
          if (a) track('nearby_card_click', { tier: chosen.tier, center: center ? center.slug : '', href: a.getAttribute('href') });
        });
        track('nearby_row_shown', { tier: chosen.tier, center: center ? center.slug : '', cards: cards.length });
      })
      .catch(function () { el.classList.add('bst-nr-nocards'); });
  });
})();
