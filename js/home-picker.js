/* home-picker.js — homepage make/model/segment search.
   Replaces the legacy inline homepage <script>. Reads the live roster from KV via
   the model-pages worker (/best-used/_roster.json, same-origin), so the dropdown
   stays in sync with Airtable MM automatically — no redeploy on status changes.
   Routes by Bestest Status:
     Approved (A) -> /used-cars SRP (make+model filter)
     Fun/Banned   -> /best-used/{slug} (worker serves the explainer)
   Embed on homepage, before </body>:
   <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/home-picker.js" defer></script>
*/
(function () {
  var ROSTER_URL = '/best-used/_roster.json';

  // Populated from the roster fetch.
  var MODELS = {};            // { make: [{ m: model, s: 'A|B|F', slug }] }
  var MAKES = [];             // sorted make names
  var MAKE_HAS_APPROVED = {}; // { make: true } when the make has >=1 approved model

  var segmentGroups = {
    SUVs: [
      { name: 'Subcompact SUVs', url: '/used-cars/best-used-subcompact-suvs', filterValue: 'Subcompact SUV', examples: 'Honda HR-V, Mazda CX-30, Hyundai Kona, Toyota Corolla Cross, Kia Seltos…' },
      { name: 'Compact SUVs', url: '/used-cars/best-used-compact-suvs', filterValue: 'Compact SUV', examples: 'Toyota RAV4, Honda CR-V, Mazda CX-5, Hyundai Tucson, Subaru Forester…' },
      { name: 'Midsize SUVs', url: '/used-cars/best-used-midsize-suvs', filterValue: 'Midsize SUV', examples: 'Honda Pilot, Toyota Highlander, Hyundai Palisade, Kia Telluride, Mazda CX-90…' },
      { name: 'Full-size SUVs', url: '/used-cars/best-used-full-size-suvs', filterValue: 'Full-Size SUV', examples: 'Chevy Tahoe and Suburban, Ford Expedition, Toyota Sequoia, GMC Yukon' }
    ],
    Cars: [
      { name: 'Compact Cars', url: '/used-cars/best-used-compact-cars', filterValue: 'Compact Car', examples: 'Toyota Corolla, Honda Civic, Mazda3, Hyundai Elantra, Kia Forte…' },
      { name: 'Midsize/Full-size Cars', url: '/used-cars/best-used-midsize-cars', filterValue: 'Midsize/Full-size Car', examples: 'Honda Accord, Toyota Camry, Hyundai Sonata, Kia K5, Subaru Legacy…' }
    ],
    Trucks: [
      { name: 'Compact/Midsize Trucks', url: '/used-cars/best-used-midsize-trucks', filterValue: 'Compact/Midsize Truck', examples: 'Toyota Tacoma, Ford Maverick, Honda Ridgeline, Chevrolet Colorado, GMC Canyon…' },
      { name: 'Full-size Trucks', url: '/used-cars/best-used-full-size-trucks', filterValue: 'Full-Size Truck', examples: 'Ford F-150, Chevrolet Silverado, Toyota Tundra, Ram 1500, GMC Sierra…' }
    ],
    Specialty: [
      { name: 'Minivans', url: '/used-cars/best-used-minivans', filterValue: 'Minivan', examples: 'Toyota Sienna, Honda Odyssey, Kia Carnival' },
      { name: 'Electric Vehicles', url: '/used-cars/best-used-electric-vehicles', filterValue: 'Electric Vehicles', examples: 'Tesla Model Y, BMW iX, Porsche Taycan, Mercedes-Benz EQB, Toyota bZ4X…' }
    ],
    'Luxury SUVs': [
      { name: 'Luxury Subcompact SUVs', url: '/used-cars/best-used-luxury-subcompact-suvs', filterValue: 'Luxury Subcompact SUV', examples: 'BMW X1, Mercedes-Benz GLA and GLB, Audi Q3, Lexus UX, Cadillac XT4…' },
      { name: 'Luxury Compact SUVs', url: '/used-cars/best-used-luxury-compact-suvs', filterValue: 'Luxury Compact SUV', examples: 'BMW X3, Mercedes-Benz GLC, Genesis GV70, Lexus NX, Acura RDX…' },
      { name: 'Luxury Midsize SUVs', url: '/used-cars/best-used-luxury-midsize-suvs', filterValue: 'Luxury Midsize SUV', examples: 'Lexus RX, Audi Q7, BMW X5, Genesis GV80, Acura MDX, Infiniti QX60…' },
      { name: 'Luxury Full-size SUVs', url: '/used-cars/best-used-luxury-full-size-suvs', filterValue: 'Luxury Full-Size SUV', examples: 'Cadillac Escalade, Lincoln Navigator, BMW X7, Lexus LX, Mercedes-Benz GLS…' }
    ],
    'Luxury Cars': [
      { name: 'Luxury Small Cars', url: '/used-cars/best-used-luxury-small-cars', filterValue: 'Luxury Small Car', examples: 'Audi A3 and A4, BMW 3 Series, Mercedes-Benz C-Class, Acura Integra…' },
      { name: 'Luxury Midsize Cars', url: '/used-cars/best-used-luxury-midsize-cars', filterValue: 'Luxury Midsize Car', examples: 'Mercedes-Benz E-Class, Audi A6, BMW 5 Series, Lexus ES, Genesis G80…' },
      { name: 'Luxury Full-size Cars', url: '/used-cars/best-used-luxury-full-size-cars', filterValue: 'Luxury Full-Size Car', examples: 'BMW 7 Series, Mercedes-Benz S-Class, Porsche Panamera, Lexus LS, Genesis G90…' }
    ]
  };

  var bstState = { make: null, seg: 'Compact SUV', zip: '92868' };

  function bstCloseAll() {
    document.querySelectorAll('.bst-dd.is-open, .bst-zip-flyout.is-open').forEach(function (el) {
      el.classList.remove('is-open');
    });
  }
  document.addEventListener('click', bstCloseAll);

  function bstWireField(triggerEl, ddEl, populate) {
    if (!triggerEl || !ddEl) return;
    triggerEl.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasOpen = ddEl.classList.contains('is-open');
      bstCloseAll();
      if (!wasOpen) { populate(); ddEl.classList.add('is-open'); }
    });
    ddEl.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  function qs(params) {
    var out = [];
    Object.keys(params).forEach(function (k) { if (params[k]) out.push(k + '=' + encodeURIComponent(params[k])); });
    return out.length ? '?' + out.join('&') : '';
  }
  function bstNavigate(params) { window.location.href = '/used-cars' + qs(params); }
  function bstNavigateSegment(url, filterValue) {
    if (url) { window.location.href = url; return; }
    bstNavigate({ segment: filterValue, zip: bstState.zip });
  }
  function bstNavigateMake(make) { bstNavigate({ make: make, zip: bstState.zip }); }
  // Approved -> SRP; Fun/Banned -> the canonical /best-used/{slug} explainer.
  function bstNavigateMakeModel(make, model, status, slug) {
    if (status === 'A') { bstNavigate({ make: make, model: model, zip: bstState.zip }); return; }
    window.location.href = '/best-used/' + slug;
  }

  function bstRenderMakes(container, onSelect) {
    container.innerHTML = MAKES.map(function (m) {
      return '<div class="bst-dd-item" data-name="' + m + '"><div class="bst-dd-item-main"><span class="bst-dd-item-name">' + m + '</span></div></div>';
    }).join('');
    container.querySelectorAll('.bst-dd-item').forEach(function (el) {
      el.addEventListener('click', function (e) { e.stopPropagation(); onSelect(el.getAttribute('data-name')); });
    });
  }

  function bstRenderModels(container, currentMake) {
    if (!currentMake) { container.innerHTML = '<div class="bst-dd-item-disabled">Pick a make first</div>'; return; }
    var models = MODELS[currentMake] || [];
    if (!models.length) { container.innerHTML = '<div class="bst-dd-item-disabled">No ' + currentMake + ' models available</div>'; return; }
    var html = '';
    if (MAKE_HAS_APPROVED[currentMake]) {
      html += '<div class="bst-dd-item go-item go-item-primary" data-action="all"><div class="bst-dd-item-main"><span class="bst-dd-item-name">See all ' + currentMake + ' models</span></div><span class="bst-go-arrow">→</span></div>';
    }
    html += models.map(function (m) {
      return '<div class="bst-dd-item go-item" data-action="model" data-name="' + m.m + '" data-status="' + m.s + '" data-slug="' + m.slug + '"><div class="bst-dd-item-main"><span class="bst-dd-item-name">' + m.m + '</span></div><span class="bst-go-arrow">→</span></div>';
    }).join('');
    container.innerHTML = html;
    container.querySelectorAll('.bst-dd-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (el.getAttribute('data-action') === 'all') bstNavigateMake(currentMake);
        else bstNavigateMakeModel(currentMake, el.getAttribute('data-name'), el.getAttribute('data-status'), el.getAttribute('data-slug'));
      });
    });
  }

  function bstRenderSegments(container) {
    var html = '';
    Object.keys(segmentGroups).forEach(function (group) {
      html += '<div class="bst-dd-section">' + group + '</div>';
      html += segmentGroups[group].map(function (s) {
        return '<div class="bst-dd-item go-item" data-name="' + s.name + '" data-url="' + (s.url || '') + '" data-filter="' + s.filterValue + '"><div class="bst-dd-item-main"><span class="bst-dd-item-name">' + s.name + '</span><span class="bst-dd-item-examples">' + s.examples + '</span></div><span class="bst-go-arrow">→</span></div>';
      }).join('');
    });
    html += '<a class="bst-dd-allcars" href="/used-cars">→ All Cars</a>';
    container.innerHTML = html;
    container.querySelectorAll('.bst-dd-item').forEach(function (el) {
      el.addEventListener('click', function (e) { e.stopPropagation(); bstNavigateSegment(el.getAttribute('data-url'), el.getAttribute('data-filter')); });
    });
  }

  function bstFindSegment(name) {
    var found = null;
    Object.keys(segmentGroups).forEach(function (group) {
      segmentGroups[group].forEach(function (s) { if (s.name === name) found = s; });
    });
    return found;
  }
  function bstPluralize(name) { return name === 'Midsize/Full-size Car' ? 'Midsize/Full-size Cars' : name + 's'; }

  function bstRender() {
    var segVal = document.getElementById('bst-seg-val');
    var seg = bstFindSegment(bstState.seg);
    if (segVal && seg) {
      segVal.innerHTML = '<span class="bst-seg-display"><span class="bst-seg-display-name">' + bstPluralize(seg.name) + '</span><span class="bst-seg-display-examples">' + seg.examples + '</span></span><span class="bst-field-chev">▾</span>';
    }
    var makeVal = document.getElementById('bst-make-val');
    if (makeVal) {
      if (bstState.make) { makeVal.classList.remove('is-placeholder'); makeVal.innerHTML = bstState.make + ' <span class="bst-field-chev">▾</span>'; }
      else { makeVal.classList.add('is-placeholder'); makeVal.innerHTML = 'Choose a make <span class="bst-field-chev">▾</span>'; }
    }
    var modelVal = document.getElementById('bst-model-val');
    if (modelVal) { modelVal.classList.add('is-placeholder'); modelVal.innerHTML = 'Choose a model <span class="bst-field-chev">▾</span>'; }
    var zipDisplay = document.getElementById('bst-zip-display');
    if (zipDisplay) zipDisplay.textContent = bstState.zip;
  }

  function wireFields() {
    bstWireField(document.querySelector('[data-bst="seg"]'), document.getElementById('bst-seg-dd'), function () {
      bstRenderSegments(document.getElementById('bst-seg-dd'));
    });
    bstWireField(document.querySelector('[data-bst="make"]'), document.getElementById('bst-make-dd'), function () {
      bstRenderMakes(document.getElementById('bst-make-dd'), function (name) {
        bstState.make = name; bstRender(); bstCloseAll();
        var modelDd = document.getElementById('bst-model-dd');
        if (modelDd) { bstRenderModels(modelDd, bstState.make); modelDd.classList.add('is-open'); }
      });
    });
    bstWireField(document.querySelector('[data-bst="model"]'), document.getElementById('bst-model-dd'), function () {
      bstRenderModels(document.getElementById('bst-model-dd'), bstState.make);
    });
    var zipTrigger = document.querySelector('[data-bst="zip"]');
    var zipFlyout = document.getElementById('bst-zip-flyout');
    var zipInput = document.getElementById('bst-zip-input');
    if (zipTrigger && zipFlyout && zipInput) {
      bstWireField(zipTrigger, zipFlyout, function () { zipInput.value = bstState.zip; });
      zipInput.addEventListener('input', function (e) {
        var v = e.target.value.replace(/\D/g, '').slice(0, 5); e.target.value = v;
        if (v.length === 5) bstState.zip = v; bstRender();
      });
      zipInput.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    bstRender();
  }

  function buildFromRoster(roster) {
    MODELS = {}; MAKE_HAS_APPROVED = {};
    var models = (roster && roster.models) || {};
    Object.keys(models).forEach(function (slug) {
      var e = models[slug];
      (MODELS[e.mk] = MODELS[e.mk] || []).push({ m: e.md, s: e.s, slug: slug });
      if (e.s === 'A') MAKE_HAS_APPROVED[e.mk] = true;
    });
    Object.keys(MODELS).forEach(function (mk) { MODELS[mk].sort(function (a, b) { return a.m.localeCompare(b.m); }); });
    MAKES = Object.keys(MODELS).sort();
  }

  function init() {
    fetch(ROSTER_URL, { credentials: 'omit' })
      .then(function (r) { return r.json(); })
      .then(function (roster) { buildFromRoster(roster); wireFields(); })
      .catch(function () { wireFields(); /* degrade: segment picker + zip still work */ });
  }
  init();
})();
