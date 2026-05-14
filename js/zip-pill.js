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

  function getCurrentZip() {
    return localStorage.getItem(STORAGE_ZIP) || DEFAULT_ZIP;
  }

  function isValidZipFormat(z) {
    return /^\d{5}$/.test(z);
  }

  function saveZipAndLatLng(zip, lat, lng) {
    localStorage.setItem(STORAGE_ZIP, zip);
    if (lat != null && lng != null) {
      localStorage.setItem(STORAGE_ZIP_LATLNG_PREFIX + zip, lat + ',' + lng);
    }
  }

  function notifyDistanceModule(zip) {
    if (window.BestestDistance && typeof window.BestestDistance.setUserZip === 'function') {
      window.BestestDistance.setUserZip(zip);
    }
  }

  // Look up lat/lng for a zip via Zippopotamus (cached in localStorage)
  function lookupZipCoords(zip) {
    var cached = localStorage.getItem(STORAGE_ZIP_LATLNG_PREFIX + zip);
    if (cached) {
      var parts = cached.split(',');
      return Promise.resolve({ lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) });
    }
    return fetch(ZIPPOPOTAMUS_URL + zip)
      .then(function(r) {
        if (!r.ok) throw new Error('Invalid zip');
        return r.json();
      })
      .then(function(data) {
        if (!data.places || !data.places.length) throw new Error('No place data');
        var lat = parseFloat(data.places[0].latitude);
        var lng = parseFloat(data.places[0].longitude);
        return { lat: lat, lng: lng };
      });
  }

  // IP-based geolocation: ipapi.co anonymous tier
  function ipAutoDetect() {
    return fetch(IPAPI_URL)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) throw new Error(data.reason || 'IP lookup failed');
        if (data.country_code !== 'US') throw new Error('Non-US visitor');
        if (!data.postal || !isValidZipFormat(data.postal)) throw new Error('No valid postal code');
        return {
          zip: data.postal,
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          region: data.region
        };
      });
  }

  // Browser geolocation: navigator.geolocation, then reverse-lookup to zip
  function browserGeolocate() {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          // Reverse-geocode to zip via Zippopotamus' nearest-postal lookup workaround:
          // Zippopotamus doesn't support lat/lng → zip directly. Use the BigDataCloud free API.
          fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lng + '&localityLanguage=en')
            .then(function(r) { return r.json(); })
            .then(function(data) {
              var zip = data.postcode;
              if (!isValidZipFormat(zip)) {
                reject(new Error('Could not determine zip from location'));
                return;
              }
              if (data.countryCode !== 'US') {
                reject(new Error('Not in US'));
                return;
              }
              resolve({ zip: zip, lat: lat, lng: lng });
            })
            .catch(function(err) { reject(err); });
        },
        function(err) {
          reject(new Error(err.message || 'Geolocation denied'));
        },
        { timeout: 10000, maximumAge: 600000, enableHighAccuracy: false }
      );
    });
  }

  // Update all pill displays on the page
  function refreshAllPills() {
    var zip = getCurrentZip();
    document.querySelectorAll('.bst-zip-pill .bst-zip-display').forEach(function(el) {
      el.textContent = zip;
    });
    document.querySelectorAll('.bst-zip-flyout input.bst-zip-input').forEach(function(input) {
      input.value = zip;
    });
  }

  // Apply a new zip: save, refresh UI, refresh distances
  function applyZip(zip, lat, lng) {
    if (!isValidZipFormat(zip)) return Promise.reject(new Error('Invalid zip format'));
    var coordsPromise;
    if (lat != null && lng != null) {
      saveZipAndLatLng(zip, lat, lng);
      coordsPromise = Promise.resolve({ lat: lat, lng: lng });
    } else {
      coordsPromise = lookupZipCoords(zip).then(function(coords) {
        saveZipAndLatLng(zip, coords.lat, coords.lng);
        return coords;
      });
    }
    return coordsPromise.then(function() {
      refreshAllPills();
      notifyDistanceModule(zip);
    });
  }

  // Build flyout HTML
  function buildFlyout(zip) {
    var html = '<span class="bst-zip-flyout-label">Zip code</span>';
    html += '<input type="text" class="bst-zip-input" maxlength="5" inputmode="numeric" value="' + zip + '">';
    html += '<div class="bst-zip-error-msg"></div>';
    html += '<button type="button" class="bst-zip-detect">' + LOCATION_SVG + 'Use my location</button>';
    return html;
  }

  // Wire up a single pill element with click-to-open + flyout interactions
  function wirePill(pill) {
    if (pill.dataset.bstZipWired) return;
    pill.dataset.bstZipWired = '1';

    var zip = getCurrentZip();

    // If the pill is empty (just a span container), populate it with pin + display
    if (!pill.querySelector('.bst-zip-display')) {
      var displaySpan = document.createElement('span');
      displaySpan.className = 'bst-zip-display';
      displaySpan.textContent = zip;
      pill.innerHTML = PIN_SVG;
      pill.appendChild(displaySpan);
    } else {
      pill.querySelector('.bst-zip-display').textContent = zip;
    }

    // Create flyout
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

    function showError(msg) {
      input.classList.add('bst-zip-error');
      errorMsg.textContent = msg;
    }
    function clearError() {
      input.classList.remove('bst-zip-error');
      errorMsg.textContent = '';
    }
    function closeFlyout() {
      flyout.classList.remove('bst-zip-flyout-open');
      clearError();
    }
    function openFlyout() {
      // Close all other flyouts first
      document.querySelectorAll('.bst-zip-flyout.bst-zip-flyout-open').forEach(function(f) {
        if (f !== flyout) f.classList.remove('bst-zip-flyout-open');
