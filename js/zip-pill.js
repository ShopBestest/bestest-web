(function() {
  var DEFAULT_ZIP = '92868';
  var DEFAULT_LAT = 33.7875;
  var DEFAULT_LNG = -117.8776;
  var STORAGE_ZIP = 'bst_user_zip';
  var STORAGE_ZIP_LATLNG_PREFIX = 'bst_zip_latlng_';
  var STORAGE_AUTODETECTED = 'bst_zip_autodetected';
  var IPAPI_URL = 'https://ipapi.co/json/';
  var ZIPPOPOTAMUS_URL = 'https://api.zippopotam.us/us/';

  var PIN_SVG = '<svg class="bst-zip-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  var SPINNER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>';
  var LOCATION_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 10v6m-11-11h6m10 0h6"></path></svg>';

  function getCurrentZip() { return localStorage.getItem(STORAGE_ZIP) || DEFAULT_ZIP; }
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
      return { lat: parseFloat(data.places[0].latitude), lng: parseFloat(data.places[0].longitude) };
    });
  }

  function ipAutoDetect() {
    return fetch(IPAPI_URL).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) throw new Error(data.reason || 'IP lookup failed');
      if (data.country_code !== 'US') throw new Error('Non-US visitor');
      if (!data.postal || !isValidZipFormat(data.postal)) throw new Error('No valid postal code');
      return { zip: data.postal, lat: data.latitude, lng: data.longitude };
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
            resolve({ zip: zip, lat: lat, lng: lng });
          })
          .catch(function(err) { reject(err); });
      }, function(err) { reject(new Error(err.message || 'Geolocation denied')); },
      { timeout: 10000, maximumAge: 600000, enableHighAccuracy: false });
    });
  }

  function refreshAllPills() {
    var zip = getCurrentZip();
    document.querySelectorAll('.bst-zip-pill .bst-zip-display').forEach(function(el) { el.textContent = zip; });
    document.querySelectorAll('.bst-zip-flyout input.bst-zip-input').forEach(function(input) { input.value = zip; });
  }

  function applyZip(zip, lat, lng) {
    if (!isValidZipFormat(zip)) return Promise.reject(new Error('Invalid zip format'));
    var coordsPromise;
    if (lat != null && lng != null) { saveZipAndLatLng(zip, lat, lng); coordsPromise = Promise.resolve({ lat: lat, lng: lng }); }
    else { coordsPromise = lookupZipCoords(zip).then(function(coords) { saveZipAndLatLng(zip, coords.lat, coords.lng); return coords; }); }
    return coordsPromise.then(function() { refreshAllPills(); notifyDistanceModule(zip); });
  }

  function buildFlyout(zip) {
    return '<span class="bst-zip-flyout-label">Zip code</span>' +
      '<input type="text" class="bst-zip-input" maxlength="5" inputmode="numeric" value="' + zip + '">' +
      '<div class="bst-zip-error-msg"></div>' +
      '<button type="button" class="bst-zip-detect">' + LOCATION_SVG + 'Use my location</button>';
  }

  function wirePill(pill) {
    if (pill.dataset.bstZipWired) return;
    pill.dataset.bstZipWired = '1';
    var zip = getCurrentZip();
    if (!pill.querySelector('.bst-zip-display')) {
      var displaySpan = document.createElement('span');
      displaySpan.className = 'bst-zip-display';
      displaySpan.textContent = zip;
      pill.innerHTML = PIN_SVG;
      pill.appendChild(displaySpan);
    } else {
      pill.querySelector('.bst-zip-display').textContent = zip;
    }
    var flyout = pill.querySelector('.bst-zip-flyout');
    if (!flyout) {
      flyout = document.createElement('div');
      flyout.className = 'bst-zip-flyout';
      flyout.innerHTML = buildFlyout(zip);
      pill.appendChild(flyout);
    }
    var input = flyout.querySelector('.bst-zip-input');
    var detectBtn = flyout.querySelector('.bst-zip-detect');
    var errorMsg = flyout.querySelector('.bst-zip-error-msg');

    function showError(msg) { input.classList.add('bst-zip-error'); errorMsg.textContent = msg; }
    function clearError() { input.classList.remove('bst-zip-error'); errorMsg.textContent = ''; }
    function closeFlyout() { flyout.classList.remove('bst-zip-flyout-open'); clearError(); }
    function openFlyout() {
      document.querySelectorAll('.bst-zip-flyout.bst-zip-flyout-open').forEach(function(f) { if (f !== flyout) f.classList.remove('bst-zip-flyout-open'); });
      input.value = getCurrentZip();
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
    input.addEventListener('input', function() {
      clearError();
      var val = input.value.replace(/\D/g, '').substring(0, 5);
      if (val !== input.value) input.value = val;
    });

    function submitInput() {
      var val = input.value.trim();
      if (!isValidZipFormat(val)) { showError('Enter a 5-digit zip code'); return; }
      if (val === getCurrentZip()) { closeFlyout(); return; }
      applyZip(val).then(function() { closeFlyout(); }).catch(function() { showError('Could not find that zip code'); });
    }

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); submitInput(); }
      else if (e.key === 'Escape') { closeFlyout(); }
    });
    input.addEventListener('blur', function() {
      setTimeout(function() {
        if (!flyout.classList.contains('bst-zip-flyout-open')) return;
        if (input.value.trim() !== getCurrentZip()) submitInput();
      }, 200);
    });

    detectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      detectBtn.disabled = true;
      detectBtn.classList.add('bst-zip-detect-loading');
      detectBtn.innerHTML = SPINNER_SVG + 'Locating...';
      clearError();
      browserGeolocate()
        .then(function(loc) { return applyZip(loc.zip, loc.lat, loc.lng); })
        .then(function() { closeFlyout(); })
        .catch(function(err) { showError(err.message || 'Could not detect location'); })
        .then(function() {
          detectBtn.disabled = false;
          detectBtn.classList.remove('bst-zip-detect-loading');
          detectBtn.innerHTML = LOCATION_SVG + 'Use my location';
        });
    });
  }

  document.addEventListener('click', function(e) {
    document.querySelectorAll('.bst-zip-flyout.bst-zip-flyout-open').forEach(function(f) {
      if (!f.parentElement.contains(e.target)) f.classList.remove('bst-zip-flyout-open');
    });
  });

  function wireAllPills() {
    document.querySelectorAll('.bst-zip-pill').forEach(wirePill);
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
      pd.setAttribute('aria-label', 'Change zip code');
      sortWrap.parentNode.insertBefore(pd, sortWrap.nextSibling);
    }
    if (!document.getElementById('bst-srp-zip-pill-mobile')) {
      var pm = document.createElement('button');
      pm.id = 'bst-srp-zip-pill-mobile';
      pm.className = 'bst-zip-pill';
      pm.type = 'button';
      pm.setAttribute('aria-label', 'Change zip code');
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

  function init() {
    if (!localStorage.getItem(STORAGE_ZIP_LATLNG_PREFIX + DEFAULT_ZIP)) {
      localStorage.setItem(STORAGE_ZIP_LATLNG_PREFIX + DEFAULT_ZIP, DEFAULT_LAT + ',' + DEFAULT_LNG);
    }
    var storedZip = localStorage.getItem(STORAGE_ZIP);
    var alreadyAutodetected = localStorage.getItem(STORAGE_AUTODETECTED);
    if (!storedZip && !alreadyAutodetected) {
      localStorage.setItem(STORAGE_AUTODETECTED, '1');
      ipAutoDetect()
        .then(function(loc) { return applyZip(loc.zip, loc.lat, loc.lng); })
        .catch(function() {});
    }
    wireAllPills();
    waitForSrpAndInject();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.BestestZipPill = { setZip: applyZip, getZip: getCurrentZip };
})();
