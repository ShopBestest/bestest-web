(function(){if(document.getElementById('bst-distance-styles'))return;var s=document.createElement('style');s.id='bst-distance-styles';s.textContent=".bst-distance-row {\n  font-size: 12px;\n  color: #6b7280;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  margin-top: 10px;\n  padding-top: 10px;\n  padding-bottom: 4px;\n  border-top: 1px solid #eee;\n  line-height: 1.3;\n  font-family: 'Montserrat', sans-serif;\n}\n.bst-distance-row svg {\n  flex-shrink: 0;\n  width: 12px;\n  height: 12px;\n}\n.bst-distance-row.bst-distance-hidden {\n  display: none;\n}\n\n@media (max-width: 767px) {\n  .w-dyn-items {\n    row-gap: 28px;\n  }\n  .bst-distance-row {\n    margin-top: 6px;\n    padding-top: 6px;\n    padding-bottom: 0;\n  }\n}\n";(document.head||document.documentElement).appendChild(s);})();
(function () {
  // Run on SRP (has cards) OR VDP (has the distance element). Bail otherwise.
  var hasCards = !!document.querySelector('.car-card');
  var hasVdpEl = !!document.querySelector('.bst-vdp-distance');
  if (!hasCards && !hasVdpEl) return;

  var DEFAULT_ZIP = '92868';
  var STORAGE_ZIP = 'bst_user_zip';
  var STORAGE_LATLNG_PREFIX = 'bst_zip_latlng_';
  var PIN_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

  var userLatLng = null;

  function getUserZip() {
    try {
      var params = new URLSearchParams(window.location.search);
      var urlZip = params.get('zip');
      if (urlZip && /^\d{5}$/.test(urlZip)) {
        localStorage.setItem(STORAGE_ZIP, urlZip);
        return urlZip;
      }
    } catch (e) {}
    try {
      var stored = localStorage.getItem(STORAGE_ZIP);
      if (stored && /^\d{5}$/.test(stored)) return stored;
    } catch (e) {}
    return DEFAULT_ZIP;
  }

  function getCachedLatLng(zip) {
    try {
      var raw = localStorage.getItem(STORAGE_LATLNG_PREFIX + zip);
      if (!raw) return null;
      var parts = raw.split(',');
      if (parts.length !== 2) return null;
      var lat = parseFloat(parts[0]);
      var lng = parseFloat(parts[1]);
      if (isNaN(lat) || isNaN(lng)) return null;
      return { lat: lat, lng: lng };
    } catch (e) {
      return null;
    }
  }

  function cacheLatLng(zip, lat, lng) {
    try {
      localStorage.setItem(STORAGE_LATLNG_PREFIX + zip, lat + ',' + lng);
    } catch (e) {}
  }

  function fetchLatLng(zip) {
    return fetch('https://api.zippopotam.us/us/' + zip)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.places || !data.places[0]) return null;
        var p = data.places[0];
        var lat = parseFloat(p.latitude);
        var lng = parseFloat(p.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;
        cacheLatLng(zip, lat, lng);
        return { lat: lat, lng: lng };
      })
      .catch(function () { return null; });
  }

  function resolveUserLatLng() {
    var zip = getUserZip();
    var cached = getCachedLatLng(zip);
    if (cached) {
      userLatLng = cached;
      return Promise.resolve(cached);
    }
    return fetchLatLng(zip).then(function (result) {
      if (result) userLatLng = result;
      return result;
    });
  }

  function haversineMiles(lat1, lng1, lat2, lng2) {
    var R = 3958.8;
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
          * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatDistance(miles) {
    if (miles < 1.5) return '1 mi away';
    return Math.round(miles) + ' mi away';
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // On city/combo pages (window.BS_CITY) the grid is sorted by distance from the
  // city centroid, so label distances from the SAME origin \u2014 otherwise labels
  // (measured from the visitor's zip) disagree with the sort and the page looks
  // unsorted. Falls back to the visitor's zip on the main SRP / VDP.
  function labelOrigin() {
    if (window.BS_CITY && typeof window.BS_CITY.lat === 'number' && typeof window.BS_CITY.lng === 'number')
      return { lat: window.BS_CITY.lat, lng: window.BS_CITY.lng };
    return userLatLng;
  }

  function buildRowContent(city, dealerLat, dealerLng) {
    if (!city) return null;
    var distanceText = '';
    // On a city page, dealers IN that city show no mileage (the city name says it
    // all and avoids a misleading "0 mi"); only out-of-city dealers show distance.
    var bsCity = (window.BS_CITY && window.BS_CITY.name) ? String(window.BS_CITY.name) : null;
    var inCity = bsCity && city.toLowerCase() === bsCity.toLowerCase();
    if (!inCity) {
      var origin = labelOrigin();
      if (origin && !isNaN(dealerLat) && !isNaN(dealerLng)) {
        var miles = haversineMiles(origin.lat, origin.lng, dealerLat, dealerLng);
        distanceText = ' \u00b7 ' + formatDistance(miles);
      }
    }
    return PIN_SVG + '<span>' + escapeHtml(city) + distanceText + '</span>';
  }

  // ---- SRP card decoration (unchanged) ----

  function decorateCard(card) {
    var city = card.getAttribute('data-dealer-city');
    var lat = parseFloat(card.getAttribute('data-dealer-lat'));
    var lng = parseFloat(card.getAttribute('data-dealer-lng'));

    var existing = card.querySelector('.bst-distance-row');
    var content = buildRowContent(city, lat, lng);

    if (!content) {
      if (existing) existing.classList.add('bst-distance-hidden');
      return;
    }

    if (existing) {
      existing.innerHTML = content;
      existing.classList.remove('bst-distance-hidden');
      return;
    }

    var row = document.createElement('div');
    row.className = 'bst-distance-row';
    row.innerHTML = content;

    var inner = card.querySelector('.car-listing-name-wrapper');
    var target = inner || card;
    target.appendChild(row);
  }

  function decorateAll() {
    var cards = document.querySelectorAll('.car-card');
    for (var i = 0; i < cards.length; i++) decorateCard(cards[i]);
  }

  // ---- VDP single-element decoration ----

  function decorateVdp() {
    var el = document.querySelector('.bst-vdp-distance');
    if (!el) return;

    var city = el.getAttribute('data-dealer-city');
    var lat = parseFloat(el.getAttribute('data-dealer-lat'));
    var lng = parseFloat(el.getAttribute('data-dealer-lng'));

    var content = buildRowContent(city, lat, lng);

    if (!content) {
      el.classList.add('bst-distance-hidden');
      return;
    }

    el.innerHTML = content;
    el.classList.remove('bst-distance-hidden');
  }

  function setupObserver() {
    var grid = document.querySelector('.collection-list-2');
    if (!grid) return;
    var observer = new MutationObserver(function (mutations) {
      var needsDecorate = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) { needsDecorate = true; break; }
      }
      if (needsDecorate) decorateAll();
    });
    observer.observe(grid, { childList: true });
  }

  function decorate() {
    if (hasCards) decorateAll();
    if (hasVdpEl) decorateVdp();
  }

  function notifyLatLng() {
    if (userLatLng && typeof window.__bsOnUserLatLng === 'function') {
      try { window.__bsOnUserLatLng(userLatLng); } catch (e) {}
    }
  }

  function init() {
    decorate();
    setupObserver();
    resolveUserLatLng().then(function () {
      decorate();
      notifyLatLng();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  window.BestestDistance = {
    setUserZip: function (zip) {
      if (!/^\d{5}$/.test(zip)) return false;
      try { localStorage.setItem(STORAGE_ZIP, zip); } catch (e) {}
      var cached = getCachedLatLng(zip);
      if (cached) {
        userLatLng = cached;
        decorate();
        return true;
      }
      fetchLatLng(zip).then(function (result) {
        if (result) {
          userLatLng = result;
          decorate();
          notifyLatLng();
        }
      });
      return true;
    },
    getUserZip: getUserZip,
    getUserLatLng: function () {
      return userLatLng || getCachedLatLng(getUserZip());
    },
    refresh: decorate
  };
})();
