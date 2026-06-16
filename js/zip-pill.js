(function(){if(document.getElementById('bst-zip-pill-styles'))return;var s=document.createElement('style');s.id='bst-zip-pill-styles';s.textContent="/* Shared zip pill styles \u2014 homepage hero + SRP filter bar */\n\n.bst-zip-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 12px;\n  color: #1a6f4a;\n  font-weight: 600;\n  cursor: pointer;\n  user-select: none;\n  line-height: 1;\n  padding: 5px 11px;\n  white-space: nowrap;\n  position: relative;\n  border-radius: 14px;\n  background: transparent;\n  border: none;\n  font-family: inherit;\n  outline: none;\n}\n.bst-zip-pill:hover .bst-zip-display,\n.bst-zip-pill:hover .bst-zip-pin { opacity: 0.75; transition: opacity 0.15s; }\n.bst-zip-pill:focus-visible { outline: 2px solid #1a6f4a; outline-offset: 2px; }\n.bst-zip-pill svg.bst-zip-pin { width: 11px; height: 11px; flex-shrink: 0; }\n.bst-zip-pill .bst-zip-display { font-variant-numeric: tabular-nums; }\n\n@media (max-width: 767px) {\n  #bst-srp-zip-pill-desktop { display: none !important; }\n  #bst-srp-zip-pill-mobile { display: inline-flex; padding: 0; }\n}\n@media (min-width: 768px) {\n  #bst-srp-zip-pill-mobile { display: none !important; }\n}\n\n.bst-zip-flyout {\n  position: fixed;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 12px;\n  box-shadow: 0 8px 24px rgba(0,0,0,0.10);\n  padding: 14px;\n  min-width: 220px;\n  z-index: 99999;\n  display: none;\n  cursor: default;\n  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;\n}\n.bst-zip-flyout.bst-zip-flyout-open { display: block; }\n.bst-zip-flyout-label {\n  display: block;\n  font-size: 11px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  color: #888;\n  margin-bottom: 8px;\n}\n.bst-zip-flyout input[type=\"text\"] {\n  width: 100%;\n  padding: 9px 12px;\n  border: 1px solid #d0d0d0;\n  border-radius: 8px;\n  font-size: 14px;\n  font-family: inherit;\n  color: #1a1a1a;\n  box-sizing: border-box;\n  font-variant-numeric: tabular-nums;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.bst-zip-flyout input[type=\"text\"]:focus { border-color: #1a6f4a; }\n.bst-zip-flyout input[type=\"text\"].bst-zip-error { border-color: #c0392b; }\n.bst-zip-flyout .bst-zip-error-msg {\n  font-size: 11px;\n  color: #c0392b;\n  margin-top: 4px;\n  min-height: 14px;\n}\n.bst-zip-save {\n  display: block;\n  width: 100%;\n  margin-top: 6px;\n  padding: 9px 12px;\n  background: #1a6f4a;\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  font-family: inherit;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.bst-zip-save:hover { background: #155539; }\n.bst-zip-divider {\n  display: flex;\n  align-items: center;\n  text-align: center;\n  margin: 10px 0 8px;\n  color: #aaa;\n  font-size: 11px;\n  letter-spacing: 0.04em;\n}\n.bst-zip-divider::before,\n.bst-zip-divider::after {\n  content: \"\";\n  flex: 1;\n  border-top: 1px solid #eee;\n}\n.bst-zip-divider span { padding: 0 10px; }\n.bst-zip-detect {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  width: 100%;\n  padding: 8px 12px;\n  background: transparent;\n  color: #1a1a1a;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 500;\n  font-family: inherit;\n  cursor: pointer;\n  transition: background 0.15s, border-color 0.15s;\n}\n.bst-zip-detect:hover { background: #f5f5f5; border-color: #c0c0c0; }\n.bst-zip-detect:disabled { opacity: 0.6; cursor: not-allowed; }\n.bst-zip-detect svg { width: 13px; height: 13px; flex-shrink: 0; }\n.bst-zip-detect.bst-zip-detect-loading svg { animation: bst-zip-spin 0.8s linear infinite; }\n@keyframes bst-zip-spin { to { transform: rotate(360deg); } }\n\n@media (max-width: 767px) {\n  .bst-zip-flyout {\n    min-width: 240px;\n    max-width: calc(100vw - 32px);\n  }\n}\n";(document.head||document.documentElement).appendChild(s);})();
(function() {
  (function() {
    if (document.getElementById('bst-zip-modal-styles')) return;
    var ms = document.createElement('style');
    ms.id = 'bst-zip-modal-styles';
    ms.textContent =
      '.bst-zip-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99998;display:none;}' +
      '.bst-zip-backdrop.bst-zip-backdrop-open{display:block;}' +
      '.bst-zip-flyout{position:fixed;top:50%;left:50%;right:auto;transform:translate(-50%,-50%);width:calc(100vw - 32px);max-width:320px;min-width:0;}' +
      '.bst-zip-flyout-close{position:absolute;top:6px;right:8px;width:28px;height:28px;border:none;background:transparent;color:#999;font-size:20px;line-height:1;cursor:pointer;padding:0;}';
    (document.head || document.documentElement).appendChild(ms);
  })();
  var DEFAULT_ZIP = '92868';
  var DEFAULT_LAT = 33.7875;
  var DEFAULT_LNG = -117.8776;
  var DEFAULT_CITY = 'Orange';
  var STORAGE_ZIP = 'bst_user_zip';
  var STORAGE_ZIP_LATLNG_PREFIX = 'bst_zip_latlng_';
  var STORAGE_ZIP_CITY_PREFIX = 'bst_zip_city_';
  var STORAGE_COVERAGE_SEEN = 'bst_coverage_notice_seen';
  var IPAPI_URL = 'https://ipapi.co/json/';
  var ZIPPOPOTAMUS_URL = 'https://api.zippopotam.us/us/';

  // Coverage area: within COVERAGE_RADIUS_MI of 92657 (Newport Coast). Used only to show
  // an informational "outside coverage" note — it never filters inventory.
  var COVERAGE_CENTER_LAT = 33.5943, COVERAGE_CENTER_LNG = -117.8334, COVERAGE_RADIUS_MI = 30;

  var PIN_SVG = '<svg class="bst-zip-pin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  var DETECT_PIN_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  var SPINNER_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>';
  var COV_PIN_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a6f4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

  function getCurrentZip() { return localStorage.getItem(STORAGE_ZIP) || DEFAULT_ZIP; }

  // Crawlers render from Google/Bing IPs (often far outside our coverage), so without this
  // their renderer could IP-detect out-of-range and paint the overlay into the DOM Google
  // evaluates — an on-load modal reads as an "intrusive interstitial". Suppressing a popup
  // by bot UA is not cloaking (page content is identical); we also skip IP-detect for bots.
  function isCrawler() {
    var ua = (navigator && navigator.userAgent) || '';
    return /bot|crawl|spider|slurp|google-inspectiontool|googleother|storebot|adsbot|mediapartners|bingpreview|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|slackbot|whatsapp|linkedinbot|embedly|pinterest|lighthouse|headlesschrome|pagespeed/i.test(ua);
  }

  // The zip module renders as a centered modal (always front-and-center wherever the pill
  // sits) over a shared dimming backdrop, instead of a popover anchored to the pill.
  function bstHideBackdrop() { var b = document.getElementById('bst-zip-backdrop'); if (b) b.classList.remove('bst-zip-backdrop-open'); }
  function bstCloseAllFlyouts() {
    document.querySelectorAll('.bst-zip-flyout.bst-zip-flyout-open').forEach(function(f) { f.classList.remove('bst-zip-flyout-open'); });
    bstHideBackdrop();
  }
  function bstGetBackdrop() {
    var b = document.getElementById('bst-zip-backdrop');
    if (!b) {
      b = document.createElement('div');
      b.id = 'bst-zip-backdrop';
      b.className = 'bst-zip-backdrop';
      (document.body || document.documentElement).appendChild(b);
      b.addEventListener('click', bstCloseAllFlyouts);
    }
    return b;
  }

  // The pill shows a place name, not a raw zip, everywhere. We cache each zip's city
  // name as we resolve it (default, IP, manual entry, geolocation) and look it up lazily
  // for any zip we don't have yet.
  function saveZipCity(zip, city) { if (city) localStorage.setItem(STORAGE_ZIP_CITY_PREFIX + zip, city); }
  function getZipCity(zip) { return localStorage.getItem(STORAGE_ZIP_CITY_PREFIX + zip); }
  function getCurrentCity() {
    var zip = getCurrentZip();
    return getZipCity(zip) || (zip === DEFAULT_ZIP ? DEFAULT_CITY : null);
  }
  var cityInFlight = {};
  function ensureCity(zip) {
    var have = getZipCity(zip);
    if (have) return Promise.resolve(have);
    if (zip === DEFAULT_ZIP) { saveZipCity(zip, DEFAULT_CITY); return Promise.resolve(DEFAULT_CITY); }
    if (cityInFlight[zip]) return cityInFlight[zip];
    var p = fetch(ZIPPOPOTAMUS_URL + zip)
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        var c = (data && data.places && data.places[0]) ? data.places[0]['place name'] : null;
        if (c) saveZipCity(zip, c);
        return c;
      })
      .catch(function() { return null; });
    cityInFlight[zip] = p;
    return p;
  }
  // Resolve the current zip's city (if unknown) then repaint the pills.
  function refreshCityLabel() {
    if (getCityMode()) return;
    ensureCity(getCurrentZip()).then(function() { refreshAllPills(); });
  }

  function getCachedLatLng(zip) {
    var raw = localStorage.getItem(STORAGE_ZIP_LATLNG_PREFIX + zip);
    if (!raw) return null;
    var p = raw.split(','); var lat = parseFloat(p[0]), lng = parseFloat(p[1]);
    return (isNaN(lat) || isNaN(lng)) ? null : { lat: lat, lng: lng };
  }
  function getCurrentLatLng() { return getCachedLatLng(getCurrentZip()); }
  function haversineMiles(lat1, lng1, lat2, lng2) {
    var R = 3958.8, toRad = Math.PI / 180;
    var dLat = (lat2 - lat1) * toRad, dLng = (lng2 - lng1) * toRad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function isOutOfCoverage(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return false;
    return haversineMiles(lat, lng, COVERAGE_CENTER_LAT, COVERAGE_CENTER_LNG) > COVERAGE_RADIUS_MI;
  }

  var BROAD_PATH = '/used-cars';
  // On city/combo pages Webflow sets window.BS_CITY = { name, lat, lng }. When present,
  // the pill shows the city name and changing location navigates to the broad SRP, so the
  // canonical city page stays city-anchored and is never personalized to the visitor.
  function getCityMode() {
    var c = window.BS_CITY;
    if (c && typeof c.lat === 'number' && typeof c.lng === 'number' && c.name) return c;
    return null;
  }
  function goToBroadWithZip(zip, lat, lng) {
    if (lat != null && lng != null) saveZipAndLatLng(zip, lat, lng);
    // Carry the city/combo page's active filters to the broad SRP so changing location
    // keeps the user's filters. User-applied filters + sort already live in the current
    // query string (the engine keeps it in sync); a combo page's defining facets live in
    // window.BS_PREFILTER and are kept out of the URL, so merge them back in.
    var params = new URLSearchParams(window.location.search);
    var pf = window.BS_PREFILTER;
    if (pf) {
      ['make', 'model', 'body_style', 'powertrain', 'price', 'miles', 'year'].forEach(function(k) {
        if (!params.get(k) && Array.isArray(pf[k]) && pf[k].length) params.set(k, pf[k].join(','));
      });
    }
    // City pages default to nearest-first; preserve that intent at the destination.
    if (getCityMode() && !params.get('sort')) params.set('sort', 'distance-asc');
    params.set('zip', zip);
    window.location.href = BROAD_PATH + '?' + params.toString();
  }
  function isValidZipFormat(z) { return /^\d{5}$/.test(z); }
  function saveZipAndLatLng(zip, lat, lng) {
    localStorage.setItem(STORAGE_ZIP, zip);
    if (lat != null && lng != null) localStorage.setItem(STORAGE_ZIP_LATLNG_PREFIX + zip, lat + ',' + lng);
  }
  function notifyDistanceModule(zip) {
    if (window.BestestDistance && typeof window.BestestDistance.setUserZip === 'function') window.BestestDistance.setUserZip(zip);
  }

  function lookupZipCoords(zip) {
    var cached = localStorage.getItem(STORAGE_ZIP_LATLNG_PREFIX + zip);
    if (cached) { var p = cached.split(','); return Promise.resolve({ lat: parseFloat(p[0]), lng: parseFloat(p[1]) }); }
    return fetch(ZIPPOPOTAMUS_URL + zip).then(function(r) {
      if (!r.ok) throw new Error('Invalid zip');
      return r.json();
    }).then(function(data) {
      if (!data.places || !data.places.length) throw new Error('No place data');
      saveZipCity(zip, data.places[0]['place name']);
      return { lat: parseFloat(data.places[0].latitude), lng: parseFloat(data.places[0].longitude) };
    });
  }

  function ipAutoDetect() {
    return fetch(IPAPI_URL).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) throw new Error(data.reason || 'IP lookup failed');
      if (data.country_code !== 'US') throw new Error('Non-US visitor');
      if (!data.postal || !isValidZipFormat(data.postal)) throw new Error('No valid postal code');
      return { zip: data.postal, lat: data.latitude, lng: data.longitude, city: data.city };
    });
  }

  function browserGeolocate() {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
      navigator.geolocation.getCurrentPosition(function(pos) {
        var lat = pos.coords.latitude, lng = pos.coords.longitude;
        fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lng + '&localityLanguage=en')
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var zip = data.postcode;
            if (!isValidZipFormat(zip)) { reject(new Error('Could not determine zip from location')); return; }
            if (data.countryCode !== 'US') { reject(new Error('Not in US')); return; }
            resolve({ zip: zip, lat: lat, lng: lng, city: data.city || data.locality });
          })
          .catch(function(err) { reject(err); });
      }, function(err) { reject(new Error(err.message || 'Geolocation denied')); },
      { timeout: 10000, maximumAge: 600000, enableHighAccuracy: false });
    });
  }

  function refreshAllPills() {
    // City pages keep the pill showing the page city name, never the zip.
    if (getCityMode()) return;
    var zip = getCurrentZip();
    // Everywhere else, show the place name (falling back to the zip until it resolves).
    var label = getCurrentCity() || zip;
    document.querySelectorAll('.bst-zip-pill .bst-zip-display').forEach(function(el) { el.textContent = label; });
    document.querySelectorAll('.bst-zip-flyout input.bst-zip-input').forEach(function(input) { input.value = zip; });
  }

  function applyZip(zip, lat, lng, city) {
    if (!isValidZipFormat(zip)) return Promise.reject(new Error('Invalid zip format'));
    if (city) saveZipCity(zip, city);
    var coordsPromise;
    if (lat != null && lng != null) { saveZipAndLatLng(zip, lat, lng); coordsPromise = Promise.resolve({ lat: lat, lng: lng }); }
    else { coordsPromise = lookupZipCoords(zip).then(function(coords) { saveZipAndLatLng(zip, coords.lat, coords.lng); return coords; }); }
    return coordsPromise.then(function() { refreshAllPills(); refreshCityLabel(); notifyDistanceModule(zip); });
  }

  function buildFlyout(zip, cityMode) {
    var label = cityMode ? 'Shop all cars near you' : 'Zip code';
    var saveText = cityMode ? 'See all cars' : 'Save';
    return '<button type="button" class="bst-zip-flyout-close" aria-label="Close">×</button>' +
      '<span class="bst-zip-flyout-label">' + label + '</span>' +
      '<input type="text" class="bst-zip-input" maxlength="5" inputmode="numeric" placeholder="' + (cityMode ? 'Enter your zip' : '') + '" value="' + (cityMode ? '' : zip) + '">' +
      '<div class="bst-zip-error-msg"></div>' +
      '<button type="button" class="bst-zip-save">' + saveText + '</button>' +
      '<div class="bst-zip-divider"><span>or</span></div>' +
      '<button type="button" class="bst-zip-detect">' + DETECT_PIN_SVG + 'Use my location</button>';
  }

  function wirePill(pill) {
    if (pill.dataset.bstZipWired) return;
    pill.dataset.bstZipWired = '1';
    var zip = getCurrentZip();
    var cityMode = getCityMode();
    var displayText = cityMode ? cityMode.name : (getCurrentCity() || zip);
    if (cityMode) pill.setAttribute('aria-label', 'Change location — shop all cars near you');
    if (!pill.querySelector('.bst-zip-display')) {
      var displaySpan = document.createElement('span');
      displaySpan.className = 'bst-zip-display';
      displaySpan.textContent = displayText;
      pill.innerHTML = PIN_SVG;
      pill.appendChild(displaySpan);
    } else {
      pill.querySelector('.bst-zip-display').textContent = displayText;
    }
    // Portal the modal to <body> so position:fixed centers against the viewport — inside the
    // pill it can land under a transformed/positioned ancestor (e.g. the hero) and mis-center.
    var flyout = document.createElement('div');
    flyout.className = 'bst-zip-flyout';
    flyout.innerHTML = buildFlyout(zip, cityMode);
    (document.body || document.documentElement).appendChild(flyout);
    var input = flyout.querySelector('.bst-zip-input');
    var saveBtn = flyout.querySelector('.bst-zip-save');
    var detectBtn = flyout.querySelector('.bst-zip-detect');
    var errorMsg = flyout.querySelector('.bst-zip-error-msg');

    function showError(msg) { input.classList.add('bst-zip-error'); errorMsg.textContent = msg; }
    function clearError() { input.classList.remove('bst-zip-error'); errorMsg.textContent = ''; }
    function closeFlyout() { flyout.classList.remove('bst-zip-flyout-open'); clearError(); bstHideBackdrop(); }
    function openFlyout() {
      document.querySelectorAll('.bst-zip-flyout.bst-zip-flyout-open').forEach(function(f) { if (f !== flyout) f.classList.remove('bst-zip-flyout-open'); });
      input.value = cityMode ? '' : getCurrentZip();
      bstGetBackdrop().classList.add('bst-zip-backdrop-open');
      flyout.classList.add('bst-zip-flyout-open');
      setTimeout(function() { input.focus(); input.select(); }, 50);
    }

    pill.addEventListener('click', function(e) {
      if (flyout.contains(e.target)) return;
      e.stopPropagation();
      if (flyout.classList.contains('bst-zip-flyout-open')) closeFlyout(); else openFlyout();
    });
    pill.addEventListener('keydown', function(e) {
      if ((e.key === 'Enter' || e.key === ' ') && !flyout.contains(e.target)) { e.preventDefault(); openFlyout(); }
    });
    flyout.addEventListener('click', function(e) { e.stopPropagation(); });
    var flyoutClose = flyout.querySelector('.bst-zip-flyout-close');
    if (flyoutClose) flyoutClose.addEventListener('click', function(e) { e.preventDefault(); closeFlyout(); });
    input.addEventListener('input', function() {
      clearError();
      var val = input.value.replace(/\D/g, '').substring(0, 5);
      if (val !== input.value) input.value = val;
    });

    function submitInput() {
      var val = input.value.trim();
      if (!isValidZipFormat(val)) { showError('Enter a 5-digit zip code'); return; }
      if (cityMode) {
        // City pages stay city-anchored; a chosen zip sends the visitor to the
        // broad /used-cars SRP personalized to that zip.
        lookupZipCoords(val)
          .then(function(coords) { goToBroadWithZip(val, coords.lat, coords.lng); })
          .catch(function() { showError('Could not find that zip code'); });
        return;
      }
      if (val === getCurrentZip()) { closeFlyout(); return; }
      applyZip(val).then(function() {
        closeFlyout();
        // An out-of-area zip fires the one-time overlay (no-ops if already seen).
        maybeShowCoverageOverlay();
      }).catch(function() { showError('Could not find that zip code'); });
    }

    saveBtn.addEventListener('click', function(e) { e.preventDefault(); submitInput(); });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); submitInput(); }
      else if (e.key === 'Escape') { closeFlyout(); }
    });

    detectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      detectBtn.disabled = true;
      detectBtn.classList.add('bst-zip-detect-loading');
      detectBtn.innerHTML = SPINNER_SVG + 'Locating...';
      clearError();
      browserGeolocate()
        .then(function(loc) {
          if (cityMode) { goToBroadWithZip(loc.zip, loc.lat, loc.lng); return; }
          return applyZip(loc.zip, loc.lat, loc.lng, loc.city).then(function() { closeFlyout(); maybeShowCoverageOverlay(); });
        })
        .catch(function(err) { showError(err.message || 'Could not detect location'); })
        .then(function() {
          detectBtn.disabled = false;
          detectBtn.classList.remove('bst-zip-detect-loading');
          detectBtn.innerHTML = DETECT_PIN_SVG + 'Use my location';
        });
    });

  }

  document.addEventListener('click', function() { bstCloseAllFlyouts(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') bstCloseAllFlyouts(); });

  function wireAllPills() {
    document.querySelectorAll('.bst-zip-pill').forEach(wirePill);
    refreshCityLabel();
  }

  function injectSrpPills() {
    var sortPill = document.getElementById('bsp-sort');
    var meta = document.querySelector('.bs-meta');
    if (!sortPill || !meta) return false;
    var sortWrap = sortPill.closest('.bs-pw');
    if (!sortWrap) return false;
    if (!document.getElementById('bst-srp-zip-pill-desktop')) {
      var pd = document.createElement('button');
      pd.id = 'bst-srp-zip-pill-desktop';
      pd.className = 'bst-zip-pill';
      pd.type = 'button';
      pd.setAttribute('aria-label', 'Change location');
      sortWrap.parentNode.insertBefore(pd, sortWrap.nextSibling);
    }
    if (!document.getElementById('bst-srp-zip-pill-mobile')) {
      var pm = document.createElement('button');
      pm.id = 'bst-srp-zip-pill-mobile';
      pm.className = 'bst-zip-pill';
      pm.type = 'button';
      pm.setAttribute('aria-label', 'Change location');
      meta.appendChild(pm);
    }
    return true;
  }

  function waitForSrpAndInject() {
    if (!document.getElementById('bs-bar')) {
      var attempts = 0;
      var iv = setInterval(function() {
        attempts++;
        if (document.getElementById('bs-bar')) { clearInterval(iv); injectSrpPills(); wireAllPills(); }
        else if (attempts > 50) clearInterval(iv);
      }, 200);
      return;
    }
    injectSrpPills();
    wireAllPills();
  }

  // One-time "outside coverage" overlay. Shown once per visitor (localStorage flag) when
  // their detected/entered location is out of range. Never on city pages; client-only so
  // it never touches server-rendered/indexed content.
  function buildCoverageOverlay() {
    var existing = document.getElementById('bst-cov-overlay');
    if (existing) return existing;
    var ov = document.createElement('div');
    ov.id = 'bst-cov-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'bst-cov-title');
    ov.style.cssText = "position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);padding:20px;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;";
    ov.innerHTML =
      '<div style="background:#fff;border-radius:14px;max-width:380px;width:100%;padding:28px 24px;text-align:center;position:relative;box-shadow:0 16px 48px rgba(0,0,0,0.18);">' +
        '<button type="button" class="bst-cov-close" aria-label="Close" style="position:absolute;top:8px;right:12px;width:30px;height:30px;border:none;background:transparent;color:#999;font-size:22px;line-height:1;cursor:pointer;padding:0;">×</button>' +
        '<div style="width:52px;height:52px;border-radius:50%;background:#e3f1e9;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' + COV_PIN_SVG + '</div>' +
        '<h2 id="bst-cov-title" style="font-size:19px;font-weight:700;margin:0 0 10px;color:#1a1a1a;line-height:1.3;">Not from the area?</h2>' +
        '<p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 20px;">Bestest is live in our home market of Orange County as we prep our national rollout.</p>' +
        '<button type="button" class="bst-cov-cta" style="width:100%;background:#1a6f4a;color:#fff;border:none;border-radius:8px;padding:12px 14px;font-size:14px;font-weight:600;cursor:pointer;">Check us out</button>' +
      '</div>';
    (document.body || document.documentElement).appendChild(ov);
    function dismiss() {
      ov.style.display = 'none';
      try { localStorage.setItem(STORAGE_COVERAGE_SEEN, '1'); } catch (e) {}
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') dismiss(); }
    ov._bstOnKey = onKey;
    ov.querySelector('.bst-cov-close').addEventListener('click', dismiss);
    ov.querySelector('.bst-cov-cta').addEventListener('click', dismiss);
    ov.addEventListener('click', function(e) { if (e.target === ov) dismiss(); });
    return ov;
  }
  function maybeShowCoverageOverlay() {
    if (getCityMode() || isCrawler()) return;
    try { if (localStorage.getItem(STORAGE_COVERAGE_SEEN)) return; } catch (e) {}
    var ll = getCurrentLatLng();
    if (!ll || !isOutOfCoverage(ll.lat, ll.lng)) return;
    var ov = buildCoverageOverlay();
    ov.style.display = 'flex';
    document.addEventListener('keydown', ov._bstOnKey);
  }

  function init() {
    if (!localStorage.getItem(STORAGE_ZIP_LATLNG_PREFIX + DEFAULT_ZIP)) {
      localStorage.setItem(STORAGE_ZIP_LATLNG_PREFIX + DEFAULT_ZIP, DEFAULT_LAT + ',' + DEFAULT_LNG);
    }
    saveZipCity(DEFAULT_ZIP, DEFAULT_CITY);
    // Non-city pages: IP-detect whenever we still have no stored zip, so a previously
    // failed/blocked attempt self-heals on the next load (applyZip persists only on
    // success). City pages stay city-anchored and never IP-personalize.
    if (!getCityMode() && !isCrawler() && !localStorage.getItem(STORAGE_ZIP)) {
      ipAutoDetect()
        .then(function(loc) { return applyZip(loc.zip, loc.lat, loc.lng, loc.city); })
        .then(function() { maybeShowCoverageOverlay(); })
        .catch(function() {});
    } else {
      maybeShowCoverageOverlay();
    }
    wireAllPills();
    waitForSrpAndInject();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.BestestZipPill = { setZip: applyZip, getZip: getCurrentZip };
})();
