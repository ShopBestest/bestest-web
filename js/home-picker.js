/* home-picker.js — homepage make/model/segment search.
   GENERATED from Airtable MM table (Bestest Status). Regenerate via gen_home_picker.py.
   Replaces the legacy inline homepage <script>. Routes by Bestest Status:
     Approved -> /used-cars SRP (make+model filter)
     Fun      -> FUN_PAGE
     Banned/other -> NOT_PAGE
   Status codes in MODELS: A=Approved, B=Banned, F=Fun.
   Embed on homepage, before </body>:
   <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/home-picker.js" defer></script>
*/
(function () {
  var FUN_PAGE = '/just-for-fun';
  var NOT_PAGE = '/not-on-bestest';

  // --- make/model roster (generated from MM) ---
  var MODELS = {
    "Acura":[{m:"ADX",s:"B"},{m:"Integra",s:"A"},{m:"MDX",s:"A"},{m:"RDX",s:"A"},{m:"TLX",s:"A"},{m:"ZDX",s:"B"}],
    "Alfa Romeo":[{m:"4C",s:"B"},{m:"Giulia",s:"B"},{m:"Stelvio",s:"B"},{m:"Tonale",s:"B"}],
    "Audi":[{m:"A3",s:"B"},{m:"A4",s:"A"},{m:"A5",s:"B"},{m:"A6",s:"A"},{m:"A6 Sportback e-tron",s:"B"},{m:"A7",s:"A"},{m:"A8",s:"A"},{m:"Q3",s:"A"},{m:"Q4 Sportback e-tron",s:"B"},{m:"Q4 e-tron",s:"B"},{m:"Q4 e-tron Sportback",s:"B"},{m:"Q5",s:"A"},{m:"Q6 Sportback e-tron",s:"B"},{m:"Q6 e-tron",s:"B"},{m:"Q7",s:"A"},{m:"Q8",s:"A"},{m:"Q8 Sportback e-tron",s:"A"},{m:"Q8 e-Tron",s:"B"},{m:"R8",s:"F"},{m:"RS 3",s:"F"},{m:"RS 5",s:"F"},{m:"RS 6",s:"F"},{m:"RS 7",s:"F"},{m:"TT",s:"F"},{m:"e-tron GT",s:"A"}],
    "BMW":[{m:"2 Series",s:"A"},{m:"3 Series",s:"A"},{m:"4 Series",s:"A"},{m:"5 Series",s:"A"},{m:"6 Series",s:"B"},{m:"7 Series",s:"A"},{m:"8 Series",s:"A"},{m:"M2",s:"F"},{m:"M3",s:"F"},{m:"M4",s:"F"},{m:"M5",s:"F"},{m:"M8",s:"F"},{m:"X1",s:"A"},{m:"X2",s:"A"},{m:"X3",s:"A"},{m:"X4",s:"A"},{m:"X5",s:"A"},{m:"X6",s:"A"},{m:"X7",s:"A"},{m:"XM",s:"B"},{m:"Z4",s:"F"},{m:"iX",s:"A"}],
    "Buick":[{m:"Enclave",s:"B"},{m:"Encore GX",s:"B"},{m:"Envision",s:"B"},{m:"Envista",s:"B"}],
    "Cadillac":[{m:"CT4",s:"B"},{m:"CT5",s:"B"},{m:"Escalade",s:"A"},{m:"Escalade IQ EV",s:"B"},{m:"Lyriq",s:"B"},{m:"Optiq",s:"B"},{m:"Vistiq",s:"B"},{m:"XT4",s:"B"},{m:"XT5",s:"B"},{m:"XT6",s:"B"}],
    "Chevrolet":[{m:"Blazer",s:"B"},{m:"Blazer EV",s:"B"},{m:"Bolt EUV",s:"A"},{m:"Bolt EV",s:"B"},{m:"Camaro",s:"F"},{m:"Colorado",s:"B"},{m:"Corvette",s:"F"},{m:"Equinox",s:"B"},{m:"Equinox EV",s:"B"},{m:"Express",s:"B"},{m:"Malibu",s:"B"},{m:"Silverado 1500",s:"A"},{m:"Silverado 1500 Limited",s:"B"},{m:"Suburban",s:"A"},{m:"Tahoe",s:"A"},{m:"TrailBlazer",s:"B"},{m:"Traverse",s:"B"},{m:"Trax",s:"B"}],
    "Chrysler":[{m:"300",s:"B"},{m:"Pacifica",s:"B"},{m:"Voyager",s:"B"}],
    "Dodge":[{m:"Challenger",s:"F"},{m:"Charger",s:"B"},{m:"Charger BEV",s:"B"},{m:"Durango",s:"B"},{m:"Hornet",s:"B"}],
    "Fiat":[{m:"500",s:"B"},{m:"500L",s:"B"},{m:"500X",s:"B"}],
    "Ford":[{m:"Bronco",s:"F"},{m:"Bronco Sport",s:"B"},{m:"E-Series",s:"B"},{m:"Edge",s:"B"},{m:"Escape",s:"B"},{m:"Expedition",s:"A"},{m:"Explorer",s:"B"},{m:"F-150",s:"A"},{m:"F-150 Lightning",s:"B"},{m:"Maverick",s:"A"},{m:"Mustang",s:"F"},{m:"Mustang Mach E",s:"B"},{m:"Mustang Mach-E",s:"A"},{m:"Ranger",s:"B"},{m:"Transit",s:"B"}],
    "GMC":[{m:"Acadia",s:"B"},{m:"Canyon",s:"B"},{m:"Hummer EV",s:"B"},{m:"Savana",s:"B"},{m:"Sierra 1500",s:"A"},{m:"Terrain",s:"B"},{m:"Yukon",s:"A"},{m:"Yukon XL",s:"A"}],
    "Genesis":[{m:"G70",s:"A"},{m:"G80",s:"B"},{m:"G90",s:"B"},{m:"GV60",s:"A"},{m:"GV70",s:"A"},{m:"GV80",s:"A"}],
    "Honda":[{m:"Accord",s:"A"},{m:"CR-V",s:"A"},{m:"Civic",s:"A"},{m:"Civic Hatchback",s:"B"},{m:"Civic Type R",s:"F"},{m:"HR-V",s:"A"},{m:"Insight",s:"B"},{m:"Odyssey",s:"A"},{m:"Passport",s:"A"},{m:"Pilot",s:"A"},{m:"Prelude",s:"B"},{m:"Prologue",s:"B"},{m:"Ridgeline",s:"A"}],
    "Hyundai":[{m:"Elantra",s:"A"},{m:"Elantra N",s:"F"},{m:"IONIQ 9",s:"B"},{m:"Ioniq 5",s:"A"},{m:"Ioniq 6",s:"A"},{m:"Kona",s:"A"},{m:"Kona EV",s:"B"},{m:"Kona N",s:"F"},{m:"Nexo",s:"B"},{m:"Palisade",s:"A"},{m:"Santa Cruz",s:"A"},{m:"Santa Fe",s:"A"},{m:"Sonata",s:"A"},{m:"Tucson",s:"A"},{m:"Venue",s:"B"}],
    "Infiniti":[{m:"Q50",s:"B"},{m:"Q60",s:"B"},{m:"QX50",s:"B"},{m:"QX55",s:"B"},{m:"QX60",s:"A"},{m:"QX80",s:"B"}],
    "Jeep":[{m:"Cherokee",s:"B"},{m:"Compass",s:"B"},{m:"Gladiator",s:"F"},{m:"Grand Cherokee",s:"B"},{m:"Grand Cherokee L",s:"B"},{m:"Grand Wagoneer",s:"B"},{m:"Recon",s:"B"},{m:"Renegade",s:"B"},{m:"Wagoneer",s:"B"},{m:"Wagoneer S",s:"B"},{m:"Wrangler",s:"F"}],
    "Kia":[{m:"Carnival",s:"A"},{m:"EV6",s:"A"},{m:"EV9",s:"A"},{m:"K4",s:"B"},{m:"K5",s:"A"},{m:"Niro",s:"A"},{m:"Niro EV",s:"B"},{m:"Rio",s:"B"},{m:"Seltos",s:"A"},{m:"Sorento",s:"A"},{m:"Soul",s:"A"},{m:"Sportage",s:"A"},{m:"Telluride",s:"A"}],
    "Land Rover":[{m:"Range Rover Velar",s:"B"}],
    "Lexus":[{m:"ES",s:"A"},{m:"GX",s:"A"},{m:"IS",s:"A"},{m:"LC",s:"F"},{m:"LS",s:"A"},{m:"LX",s:"A"},{m:"NX",s:"A"},{m:"RC",s:"F"},{m:"RC F",s:"F"},{m:"RX",s:"A"},{m:"RZ",s:"B"},{m:"TX",s:"A"},{m:"UX",s:"A"}],
    "Lincoln":[{m:"Aviator",s:"B"},{m:"Corsair",s:"B"},{m:"MKX/Nautilus",s:"B"},{m:"Nautilus",s:"B"},{m:"Navigator",s:"A"}],
    "Mazda":[{m:"CX-30",s:"A"},{m:"CX-5",s:"A"},{m:"CX-50",s:"A"},{m:"CX-70",s:"B"},{m:"CX-9",s:"B"},{m:"CX-90",s:"A"},{m:"MX-5 Miata",s:"F"},{m:"Mazda3",s:"A"}],
    "Mercedes-Benz":[{m:"A-Class",s:"B"},{m:"AMG C-Class",s:"F"},{m:"AMG E-Class",s:"F"},{m:"AMG GT",s:"F"},{m:"B-Class",s:"B"},{m:"C-Class",s:"B"},{m:"CLA",s:"B"},{m:"CLE",s:"A"},{m:"CLS",s:"B"},{m:"E-Class",s:"A"},{m:"EQB",s:"A"},{m:"EQE",s:"B"},{m:"EQE SUV",s:"B"},{m:"EQE Sedan",s:"B"},{m:"EQS",s:"B"},{m:"EQS SUV",s:"B"},{m:"EQS-Sedan",s:"B"},{m:"G-Class",s:"A"},{m:"GL",s:"B"},{m:"GLA",s:"A"},{m:"GLB",s:"A"},{m:"GLC",s:"A"},{m:"GLE",s:"A"},{m:"GLS",s:"A"},{m:"Metris",s:"B"},{m:"S-Class",s:"A"},{m:"SL",s:"F"},{m:"Sprinter",s:"B"}],
    "Mini":[{m:"Cooper",s:"B"},{m:"Countryman",s:"B"}],
    "Mitsubishi":[{m:"Eclipse Cross",s:"B"},{m:"Mirage",s:"B"},{m:"Outlander",s:"B"},{m:"Outlander Sport",s:"B"}],
    "Nissan":[{m:"Altima",s:"A"},{m:"Ariya",s:"A"},{m:"Armada",s:"B"},{m:"Frontier",s:"A"},{m:"GT-R",s:"F"},{m:"Kicks",s:"B"},{m:"Leaf",s:"B"},{m:"Maxima",s:"B"},{m:"Murano",s:"B"},{m:"Pathfinder",s:"B"},{m:"Rogue",s:"B"},{m:"Sentra",s:"B"},{m:"Titan",s:"B"},{m:"Versa",s:"B"},{m:"Z",s:"F"}],
    "Polestar":[{m:"2",s:"B"},{m:"3",s:"B"},{m:"4",s:"B"}],
    "Porsche":[{m:"718",s:"F"},{m:"911",s:"F"},{m:"Cayenne",s:"A"},{m:"Macan",s:"A"},{m:"Panamera",s:"A"},{m:"Taycan",s:"A"}],
    "Ram":[{m:"1500",s:"A"},{m:"ProMaster",s:"B"},{m:"ProMaster City",s:"B"}],
    "Subaru":[{m:"Ascent",s:"B"},{m:"BRZ",s:"F"},{m:"Crosstrek",s:"A"},{m:"Forester",s:"A"},{m:"Impreza",s:"B"},{m:"Legacy",s:"A"},{m:"Outback",s:"A"},{m:"Solterra",s:"B"},{m:"WRX",s:"F"},{m:"WRX STI",s:"F"}],
    "Tesla":[{m:"Cybertruck",s:"B"},{m:"Model 3",s:"A"},{m:"Model S",s:"A"},{m:"Model X",s:"B"},{m:"Model Y",s:"A"}],
    "Toyota":[{m:"4Runner",s:"A"},{m:"C-HR",s:"B"},{m:"Camry",s:"A"},{m:"Corolla",s:"A"},{m:"Corolla Cross",s:"A"},{m:"Crown",s:"A"},{m:"Crown Signia",s:"B"},{m:"GR Corolla",s:"F"},{m:"GR86",s:"F"},{m:"Grand Highlander",s:"A"},{m:"Highlander",s:"A"},{m:"Land Cruiser",s:"A"},{m:"Mirai",s:"B"},{m:"Prius",s:"A"},{m:"RAV4",s:"A"},{m:"Sequoia",s:"A"},{m:"Sienna",s:"A"},{m:"Supra",s:"F"},{m:"Tacoma",s:"A"},{m:"Tundra",s:"A"},{m:"Venza",s:"A"},{m:"bZ4X",s:"B"}],
    "Volkswagen":[{m:"Arteon",s:"B"},{m:"Atlas",s:"B"},{m:"Atlas Sport",s:"B"},{m:"GTI",s:"F"},{m:"Golf",s:"B"},{m:"Golf R",s:"F"},{m:"ID. Buzz",s:"B"},{m:"ID.4",s:"B"},{m:"Jetta",s:"B"},{m:"Taos",s:"B"},{m:"Tiguan",s:"B"}],
    "Volvo":[{m:"60-Series",s:"B"},{m:"90-Series",s:"B"},{m:"C40",s:"B"},{m:"EX30",s:"B"},{m:"EX90",s:"B"},{m:"XC40",s:"B"},{m:"XC60",s:"A"},{m:"XC90",s:"B"}]
  };
  var MAKE_HAS_APPROVED = {"Acura":1,"Audi":1,"BMW":1,"Cadillac":1,"Chevrolet":1,"Ford":1,"GMC":1,"Genesis":1,"Honda":1,"Hyundai":1,"Infiniti":1,"Kia":1,"Lexus":1,"Lincoln":1,"Mazda":1,"Mercedes-Benz":1,"Nissan":1,"Porsche":1,"Ram":1,"Subaru":1,"Tesla":1,"Toyota":1,"Volvo":1};
  var MAKES = ["Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Fiat", "Ford", "GMC", "Genesis", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar", "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"];

  var STATUS_NAME = { A: 'Approved', B: 'Banned', F: 'Fun' };

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
  function bstNavigateMake(make) {
    if (MAKE_HAS_APPROVED[make]) bstNavigate({ make: make, zip: bstState.zip });
    else window.location.href = NOT_PAGE + qs({ make: make });
  }
  // Status-aware: Approved -> SRP, Fun -> fun page, anything else -> not-carried page.
  function bstNavigateMakeModel(make, model, status) {
    if (status === 'A') { bstNavigate({ make: make, model: model, zip: bstState.zip }); return; }
    var page = (status === 'F') ? FUN_PAGE : NOT_PAGE;
    window.location.href = page + qs({ make: make, model: model });
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
    // "See all X models" only when the make has approved inventory to show.
    if (MAKE_HAS_APPROVED[currentMake]) {
      html += '<div class="bst-dd-item go-item go-item-primary" data-action="all"><div class="bst-dd-item-main"><span class="bst-dd-item-name">See all ' + currentMake + ' models</span></div><span class="bst-go-arrow">\u2192</span></div>';
    }
    html += models.map(function (m) {
      return '<div class="bst-dd-item go-item" data-action="model" data-name="' + m.m + '" data-status="' + m.s + '"><div class="bst-dd-item-main"><span class="bst-dd-item-name">' + m.m + '</span></div><span class="bst-go-arrow">\u2192</span></div>';
    }).join('');
    container.innerHTML = html;
    container.querySelectorAll('.bst-dd-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (el.getAttribute('data-action') === 'all') bstNavigateMake(currentMake);
        else bstNavigateMakeModel(currentMake, el.getAttribute('data-name'), el.getAttribute('data-status'));
      });
    });
  }

  function bstRenderSegments(container) {
    var html = '';
    Object.keys(segmentGroups).forEach(function (group) {
      html += '<div class="bst-dd-section">' + group + '</div>';
      html += segmentGroups[group].map(function (s) {
        return '<div class="bst-dd-item go-item" data-name="' + s.name + '" data-url="' + (s.url || '') + '" data-filter="' + s.filterValue + '"><div class="bst-dd-item-main"><span class="bst-dd-item-name">' + s.name + '</span><span class="bst-dd-item-examples">' + s.examples + '</span></div><span class="bst-go-arrow">\u2192</span></div>';
      }).join('');
    });
    html += '<a class="bst-dd-allcars" href="/used-cars">\u2192 All Cars</a>';
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
      segVal.innerHTML = '<span class="bst-seg-display"><span class="bst-seg-display-name">' + bstPluralize(seg.name) + '</span><span class="bst-seg-display-examples">' + seg.examples + '</span></span><span class="bst-field-chev">\u25be</span>';
    }
    var makeVal = document.getElementById('bst-make-val');
    if (makeVal) {
      if (bstState.make) { makeVal.classList.remove('is-placeholder'); makeVal.innerHTML = bstState.make + ' <span class="bst-field-chev">\u25be</span>'; }
      else { makeVal.classList.add('is-placeholder'); makeVal.innerHTML = 'Choose a make <span class="bst-field-chev">\u25be</span>'; }
    }
    var modelVal = document.getElementById('bst-model-val');
    if (modelVal) { modelVal.classList.add('is-placeholder'); modelVal.innerHTML = 'Choose a model <span class="bst-field-chev">\u25be</span>'; }
    var zipDisplay = document.getElementById('bst-zip-display');
    if (zipDisplay) zipDisplay.textContent = bstState.zip;
  }

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
})();
