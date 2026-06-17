(function(){if(document.getElementById('bsx-band-styles'))return;var s=document.createElement('style');s.id='bsx-band-styles';s.textContent=".bsx-band, .bsx-band *,\n.bsx-sticky, .bsx-sticky *,\n.bsx-picker, .bsx-picker *,\n.bsx-allcars {\n  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;\n}\n\nbody.bsx-active .w-nav { transition: opacity .25s ease; }\nbody.bsx-active.bsx-sticky-on .w-nav { opacity: 0; pointer-events: none; }\n\n.bsx-band {\n  background: #f0f7f2;\n  padding: 14px 0 12px;\n  margin: 0 0 8px;\n  width: 100%;\n  align-self: stretch;\n  flex-shrink: 0;\n  border-radius: 10px;\n}\n.bsx-band-inner { max-width: none; margin: 0; padding: 0 24px; }\n.bsx-title { font-size: 16px; color: #1a1a1a; line-height: 1.4; margin: 0 0 8px; font-weight: 400; }\nbody.bsx-broad .bsx-title { margin: 0; }\n.bsx-prefix { font-weight: 700; color: #1a1a1a; }\n.bsx-seglink { color: #1a1a1a; font-weight: 700; cursor: pointer; display: inline-flex; align-items: baseline; gap: 5px; }\n.bsx-seglink-text { border-bottom: 1.5px solid #1a6f4a; padding-bottom: 1px; transition: border-color .15s; }\n.bsx-seglink:hover .bsx-seglink-text { border-bottom-color: #1a1a1a; }\n.bsx-seglink-chev { width: 16px; height: 16px; color: #1a6f4a; transform: translateY(3px); flex-shrink: 0; }\n\n.bsx-chips {\n  display: flex;\n  gap: 7px;\n  overflow-x: auto;\n  padding-bottom: 2px;\n  padding-right: 24px;\n  scrollbar-width: none;\n  -webkit-mask-image: linear-gradient(to right, black calc(100% - 32px), transparent);\n  mask-image: linear-gradient(to right, black calc(100% - 32px), transparent);\n}\n.bsx-chips::-webkit-scrollbar { display: none; }\n.bsx-chip {\n  flex-shrink: 0;\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 5px 11px;\n  border-radius: 14px;\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n  user-select: none;\n  transition: all .15s;\n  white-space: nowrap;\n  background: #fff;\n  border: 1px solid #e5e0d0;\n  line-height: 1.3;\n}\n/* Checkmark is always visible \u2014 signals \"Bestest recommended\", not filter state.\n   Keeps chip widths stable when toggling filter. */\n.bsx-chip .bsx-check { font-size: 11px; color: #1a6f4a; display: inline-block; }\n.bsx-chip .bsx-ct    { font-size: 11px; font-weight: 500; }\n/* Active (included in current filter, or no filter applied yet) */\n.bsx-chip.bsx-on  { color: #1a1a1a; border-color: #1a6f4a; }\n.bsx-chip.bsx-on .bsx-ct { color: #6b7280; }\n/* Inactive (deselected by user) */\n.bsx-chip.bsx-off { color: #aaa; border-color: #e5e0d0; }\n.bsx-chip.bsx-off .bsx-ct { color: #aaa; }\n.bsx-chip.bsx-off .bsx-check { opacity: 0.55; }\n.bsx-chip:hover         { opacity: .9; }\n.bsx-chip.bsx-off:hover { opacity: 1; }\n\n.bsx-pills-row { display: flex; align-items: center; gap: 12px; }\n.bsx-pills-row .bs-pills { flex: 1; min-width: 0; }\n.bsx-allcars { font-size: 12px; color: #6b7280; text-decoration: none; cursor: pointer; white-space: nowrap; flex-shrink: 0; font-weight: 500; }\n.bsx-allcars:hover { color: #1a1a1a; }\n.bsx-allcars-mob { display: none; }\n\n.bsx-picker {\n  position: fixed;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 12px;\n  box-shadow: 0 8px 24px rgba(0,0,0,.10);\n  padding: 6px 0;\n  width: 380px;\n  max-height: 70vh;\n  overflow-y: auto;\n  z-index: 9998;\n  display: none;\n}\n.bsx-picker.bsx-open { display: block; }\n.bsx-pgrouplabel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; background: #f3f3f0; padding: 7px 14px; margin: 0; }\n.bsx-pitem { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 12px; padding: 11px 14px; cursor: pointer; text-decoration: none; color: inherit; border-bottom: 0.5px solid #f2f0e8; }\n.bsx-pitem:hover { background: #faf8f1; }\n.bsx-pitem.bsx-pactive { background: #e8f3ec; }\n.bsx-pitem.bsx-pactive .bsx-pname { color: #1a6f4a; }\n.bsx-ptext { min-width: 0; }\n.bsx-pname { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 2px; line-height: 1.25; }\n.bsx-peg { font-size: 12px; color: #6b7280; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.bsx-parrow { color: #c0c0c0; font-size: 14px; flex-shrink: 0; }\n.bsx-pitem:hover .bsx-parrow { color: #1a1a1a; }\n.bsx-pallcars { padding: 10px 14px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #6b7280; font-weight: 500; border-top: 0.5px solid #e0e0e0; margin-top: 4px; text-decoration: none; }\n.bsx-pallcars:hover { background: #f5f5f5; color: #1a1a1a; }\n.bsx-pallcars.bsx-pactive { background: #f3f3f0; color: #1a1a1a; font-weight: 600; }\n\n.bsx-sticky {\n  position: fixed;\n  top: 0; left: 0; right: 0;\n  background: rgba(255,255,255,.96);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  border-bottom: 0.5px solid #e0e0e0;\n  padding: 14px 32px;\n  z-index: 9997;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity .25s ease;\n}\n.bsx-sticky.bsx-svisible { opacity: 1; pointer-events: auto; }\n.bsx-sticky-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; gap: 16px; }\n.bsx-sticky-btn { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; font-size: 20px; font-weight: 700; color: #1a6f4a; }\n.bsx-sticky-btn:hover { opacity: .8; }\n.bsx-sticky-btn .bsx-sticky-chev { width: 22px; height: 22px; flex-shrink: 0; }\n\n.bsx-readmore-toggle {\n  display: none;\n  background: none !important;\n  border: none !important;\n  outline: none !important;\n  box-shadow: none !important;\n  padding: 0 !important;\n  margin: 0;\n  color: #6b7280;\n  font-weight: 500;\n  cursor: pointer;\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n  -webkit-appearance: none;\n  appearance: none;\n}\n.bsx-readmore-toggle:focus,\n.bsx-readmore-toggle:focus-visible,\n.bsx-readmore-toggle:active { outline: none !important; box-shadow: none !important; }\n\n@media (max-width: 720px) {\n  .bsx-band { padding: 8px 0 6px; }\n  .bsx-band-inner { padding: 0 16px; }\n  .bsx-title { font-size: 15px; margin: 0 0 6px; }\n  body.bsx-broad .bsx-title { margin: 0; }\n  .bsx-sticky { padding: 12px 16px; }\n  .bsx-sticky-btn { font-size: 17px; }\n  .bsx-sticky-btn .bsx-sticky-chev { width: 19px; height: 19px; }\n  .bsx-picker { width: calc(100vw - 32px); max-width: 380px; }\n  .bsx-allcars-desk { display: none; }\n  .bsx-allcars-mob { display: inline; }\n  .bsx-chips { padding-bottom: 0; }\n  .bsx-chip { padding: 4px 10px; font-size: 11px; }\n  body.bsx-active .srp-title { font-size: 22px !important; line-height: 1.2 !important; margin-bottom: 6px !important; }\n  body.bsx-active .srp-intro {\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n    margin-bottom: 0 !important;\n    line-height: 1.4 !important;\n    font-size: 14px !important;\n    position: relative;\n  }\n  body.bsx-active .srp-intro.bsx-rm-expanded { -webkit-line-clamp: unset; overflow: visible; }\n  body.bsx-active .srp-intro .bsx-readmore-toggle.bsx-rm-visible { display: inline; }\n  body.bsx-active .srp-intro.bsx-rm-expanded .bsx-readmore-toggle { display: none; }\n  /* Right-edge fade: feather over 24px and end at 35% alpha (not full\n     transparent) so the trailing chip stays readable but signals \"more\". */\n  .bsx-chips {\n    -webkit-mask-image: linear-gradient(to right, black calc(100% - 24px), rgba(0,0,0,0.35));\n    mask-image: linear-gradient(to right, black calc(100% - 24px), rgba(0,0,0,0.35));\n  }\n}\n\nbody.bsx-broad .content-wrapper > .bsx-band,\nbody.bsx-active .content-wrapper > .bsx-band {\n  width: 100% !important;\n  max-width: none !important;\n  align-self: stretch !important;\n  margin-left: 0 !important;\n  margin-right: 0 !important;\n  flex: 0 0 auto !important;\n  padding-left: 24px !important;\n  padding-right: 24px !important;\n  border-radius: 10px !important;\n  box-sizing: border-box !important;\n}\nbody.bsx-broad .content-wrapper > .bsx-band > .bsx-band-inner,\nbody.bsx-active .content-wrapper > .bsx-band > .bsx-band-inner {\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  width: 100% !important;\n}\n\n@media (max-width: 720px) {\n  body.bsx-active .srp-intro { display: none !important; }\n  /* Tighter band padding on mobile. Must come AFTER the bsx-broad/bsx-active\n     padding-left: 24px !important block above; CSS resolves equal-specificity\n     !important conflicts by source order, so this needs to be the LAST rule\n     touching .bsx-band padding in the file. */\n  body.bsx-broad .content-wrapper > .bsx-band,\n  body.bsx-active .content-wrapper > .bsx-band {\n    padding-left: 14px !important;\n    padding-right: 14px !important;\n  }\n}\n";(document.head||document.documentElement).appendChild(s);})();
(function() {
  var MODE = window.BS_SEGMENT ? 'segment' : (window.BS_BROAD ? 'broad' : null);
  if (!MODE) return;

  var SEGMENT_GROUPS = {
    'SUVs': [
      { name: 'Subcompact SUV',   url: '/used-cars/best-used-subcompact-suvs',   filterValue: 'Subcompact SUV',     examples: 'Honda HR-V, Mazda CX-30, Hyundai Kona, Toyota Corolla Cross, Kia Seltos…' },
      { name: 'Compact SUV',      url: '/used-cars/best-used-compact-suvs',      filterValue: 'Compact SUV',        examples: 'Toyota RAV4, Honda CR-V, Mazda CX-5, Hyundai Tucson, Subaru Forester…' },
      { name: 'Midsize SUV',      url: '/used-cars/best-used-midsize-suvs',      filterValue: 'Midsize SUV',        examples: 'Honda Pilot, Toyota Highlander, Hyundai Palisade, Kia Telluride, Mazda CX-90…' },
      { name: 'Full-size SUV',    url: '/used-cars/best-used-full-size-suvs',    filterValue: 'Full-Size SUV',      examples: 'Chevy Tahoe and Suburban, Ford Expedition, Toyota Sequoia, GMC Yukon' }
    ],
    'Cars': [
      { name: 'Compact Car',           url: '/used-cars/best-used-compact-cars',  filterValue: 'Compact Car',           examples: 'Toyota Corolla, Honda Civic, Mazda3, Hyundai Elantra, Kia Forte…' },
      { name: 'Midsize/Full-size Car', url: '/used-cars/best-used-midsize-cars',  filterValue: 'Midsize/Full-size Car', examples: 'Honda Accord, Toyota Camry, Hyundai Sonata, Kia K5, Subaru Legacy…' }
    ],
    'Trucks': [
      { name: 'Compact/Midsize Truck', url: '/used-cars/best-used-midsize-trucks',   filterValue: 'Compact/Midsize Truck', examples: 'Toyota Tacoma, Ford Maverick, Honda Ridgeline, Chevrolet Colorado, GMC Canyon…' },
      { name: 'Full-size Truck',       url: '/used-cars/best-used-full-size-trucks', filterValue: 'Full-Size Truck',       examples: 'Ford F-150, Chevrolet Silverado, Toyota Tundra, Ram 1500, GMC Sierra…' }
    ],
    // Positioned before Luxury so the Specialty options get maximum visibility.
    'Specialty': [
      { name: 'Minivan',           url: '/used-cars/best-used-minivans',          filterValue: 'Minivan',           examples: 'Toyota Sienna, Honda Odyssey, Kia Carnival' },
      { name: 'Electric Vehicles', url: '/used-cars/best-used-electric-vehicles', filterValue: 'Electric Vehicles', examples: 'Tesla Model Y, BMW iX, Porsche Taycan, Mercedes-Benz EQB, Toyota bZ4X…' }
    ],
    'Luxury SUVs': [
      { name: 'Luxury Subcompact SUV', url: '/used-cars/best-used-luxury-subcompact-suvs', filterValue: 'Luxury Subcompact SUV', examples: 'BMW X1, Mercedes-Benz GLA and GLB, Audi Q3, Lexus UX, Cadillac XT4…' },
      { name: 'Luxury Compact SUV',    url: '/used-cars/best-used-luxury-compact-suvs',    filterValue: 'Luxury Compact SUV',    examples: 'BMW X3, Mercedes-Benz GLC, Genesis GV70, Lexus NX, Acura RDX…' },
      { name: 'Luxury Midsize SUV',    url: '/used-cars/best-used-luxury-midsize-suvs',    filterValue: 'Luxury Midsize SUV',    examples: 'Lexus RX, Audi Q7, BMW X5, Genesis GV80, Acura MDX, Infiniti QX60…' },
      { name: 'Luxury Full-size SUV',  url: '/used-cars/best-used-luxury-full-size-suvs',  filterValue: 'Luxury Full-Size SUV',  examples: 'Cadillac Escalade, Lincoln Navigator, BMW X7, Lexus LX, Mercedes-Benz GLS…' }
    ],
    'Luxury Cars': [
      { name: 'Luxury Small Car',     url: '/used-cars/best-used-luxury-small-cars',     filterValue: 'Luxury Small Car',     examples: 'Audi A3 and A4, BMW 3 Series, Mercedes-Benz C-Class, Acura Integra…' },
      { name: 'Luxury Midsize Car',   url: '/used-cars/best-used-luxury-midsize-cars',   filterValue: 'Luxury Midsize Car',   examples: 'Mercedes-Benz E-Class, Audi A6, BMW 5 Series, Lexus ES, Genesis G80…' },
      { name: 'Luxury Full-size Car', url: '/used-cars/best-used-luxury-full-size-cars', filterValue: 'Luxury Full-Size Car', examples: 'BMW 7 Series, Mercedes-Benz S-Class, Porsche Panamera, Lexus LS, Genesis G90…' }
    ]
  };

  function plural(name) {
    if (name.indexOf('(') !== -1) {
      return name.replace(/^(.+?)( \(.+\))$/, function(_, base, paren) {
        if (base.charAt(base.length - 1).toLowerCase() === 's') return base + paren;
        return base.replace(/(\w)$/, '$1s') + paren;
      });
    }
    if (name.charAt(name.length - 1).toLowerCase() === 's') return name;
    return name + 's';
  }

  function findActiveSegment() {
    var groupNames = Object.keys(SEGMENT_GROUPS);
    for (var i = 0; i < groupNames.length; i++) {
      var items = SEGMENT_GROUPS[groupNames[i]];
      for (var j = 0; j < items.length; j++) {
        if (items[j].filterValue === window.BS_SEGMENT) return items[j];
      }
    }
    return null;
  }

  var ACTIVE = null;
  var ACTIVE_PLURAL = '';
  if (MODE === 'segment') {
    ACTIVE = findActiveSegment();
    if (!ACTIVE) return;
    ACTIVE_PLURAL = plural(ACTIVE.name);
  }

  document.body.classList.add('bsx-active');
  if (MODE === 'broad') document.body.classList.add('bsx-broad');

  function buildBand() {
    var dynList = document.querySelector('.w-dyn-list');
    var bsBar = document.getElementById('bs-bar');
    if (!dynList || !bsBar) return false;

    var band = document.createElement('div');
    band.className = 'bsx-band';
    band.id = 'bsx-band';

    if (MODE === 'segment') {
      band.innerHTML =
        '<div class="bsx-band-inner">' +
          '<p class="bsx-title">' +
            '<span class="bsx-prefix">The Best Used</span> ' +
            '<span class="bsx-seglink" id="bsx-seglink">' +
              '<span class="bsx-seglink-text">' + ACTIVE_PLURAL + '</span>' +
              '<svg class="bsx-seglink-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
            '</span>' +
          '</p>' +
          '<div class="bsx-chips" id="bsx-chips"></div>' +
        '</div>';
    } else {
      band.innerHTML =
        '<div class="bsx-band-inner">' +
          '<p class="bsx-title">' +
            '<span class="bsx-prefix">Viewing</span> ' +
            '<span class="bsx-seglink" id="bsx-seglink">' +
              '<span class="bsx-seglink-text">All Cars</span>' +
              '<svg class="bsx-seglink-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
            '</span>' +
          '</p>' +
        '</div>';
    }

    bsBar.parentNode.insertBefore(band, bsBar);

    var pills = bsBar.querySelector('.bs-pills');
    if (pills && MODE === 'segment') {
      var pillsRow = document.createElement('div');
      pillsRow.className = 'bsx-pills-row';
      pills.parentNode.insertBefore(pillsRow, pills);
      pillsRow.appendChild(pills);
      var allcarsDesk = document.createElement('a');
      allcarsDesk.className = 'bsx-allcars bsx-allcars-desk';
      allcarsDesk.href = '/used-cars';
      allcarsDesk.textContent = 'See all listings →';
      pillsRow.appendChild(allcarsDesk);
    }

    if (MODE === 'segment') {
      var bsMeta = bsBar.querySelector('.bs-meta');
      if (bsMeta) {
        var allcarsMob = document.createElement('a');
        allcarsMob.className = 'bsx-allcars bsx-allcars-mob';
        allcarsMob.href = '/used-cars';
        allcarsMob.textContent = 'See all listings →';
        bsMeta.appendChild(allcarsMob);
      }
    }

    var sticky = document.createElement('div');
    sticky.className = 'bsx-sticky';
    sticky.id = 'bsx-sticky';
    var stickyLabel = MODE === 'segment' ? ACTIVE_PLURAL : 'All Cars';
    sticky.innerHTML =
      '<div class="bsx-sticky-inner">' +
        '<div class="bsx-sticky-btn" id="bsx-sticky-btn">' +
          '<span class="bsx-sticky-label">' + stickyLabel + '</span>' +
          '<svg class="bsx-sticky-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
        '</div>' +
      '</div>';
    document.body.appendChild(sticky);

    var picker = document.createElement('div');
    picker.className = 'bsx-picker';
    picker.id = 'bsx-picker';
    document.body.appendChild(picker);
    renderPicker();

    return true;
  }

  function renderPicker() {
    var picker = document.getElementById('bsx-picker');
    if (!picker) return;
    var html = '';
    Object.keys(SEGMENT_GROUPS).forEach(function(groupName) {
      html += '<p class="bsx-pgrouplabel">' + groupName + '</p>';
      SEGMENT_GROUPS[groupName].forEach(function(s) {
        var cls = (MODE === 'segment' && s.filterValue === window.BS_SEGMENT) ? 'bsx-pactive' : '';
        var label = plural(s.name);
        html += '<a class="bsx-pitem ' + cls + '" href="' + s.url + '">' +
          '<div class="bsx-ptext">' +
            '<p class="bsx-pname">' + label + '</p>' +
            '<p class="bsx-peg">' + s.examples + '</p>' +
          '</div>' +
          '<span class="bsx-parrow">→</span>' +
        '</a>';
      });
    });
    var allcarsCls = MODE === 'broad' ? ' bsx-pactive' : '';
    html += '<a class="bsx-pallcars' + allcarsCls + '" href="/used-cars">→ All Cars</a>';
    picker.innerHTML = html;
  }

  var pickerAnchor = null;
  function openPicker(anchor) {
    var picker = document.getElementById('bsx-picker');
    pickerAnchor = anchor;
    var rect = anchor.getBoundingClientRect();
    var topOffset = rect.bottom + 6;
    picker.style.top = topOffset + 'px';
    // Cap picker height to viewport space minus a bottom buffer so it never
    // runs all the way to the bottom of the page. 24px breathing room below.
    // Min 200px so a short remaining viewport still shows useful content.
    var availableHeight = window.innerHeight - topOffset - 24;
    picker.style.maxHeight = Math.max(availableHeight, 200) + 'px';
    var vw = window.innerWidth;
    if (rect.left + 380 + 16 > vw) {
      picker.style.left = 'auto';
      picker.style.right = '16px';
    } else {
      picker.style.left = rect.left + 'px';
      picker.style.right = 'auto';
    }
    picker.classList.add('bsx-open');
  }

  function closePicker() {
    var picker = document.getElementById('bsx-picker');
    if (picker) picker.classList.remove('bsx-open');
    pickerAnchor = null;
  }

  function wirePickerHandlers() {
    var seglink = document.getElementById('bsx-seglink');
    var stickyBtn = document.getElementById('bsx-sticky-btn');
    [seglink, stickyBtn].forEach(function(el) {
      if (!el) return;
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var picker = document.getElementById('bsx-picker');
        if (picker.classList.contains('bsx-open') && pickerAnchor === el) {
          closePicker();
        } else {
          openPicker(el);
        }
      });
    });
    document.addEventListener('click', function(e) {
      var picker = document.getElementById('bsx-picker');
      if (picker && picker.classList.contains('bsx-open') && !picker.contains(e.target)) {
        closePicker();
      }
    });
  }

  function computeModelCounts() {
    var allItems = window.Bestest.getAllItems();
    var getData = window.Bestest.getData;
    var counts = {};
    var labels = {};
    allItems.forEach(function(item) {
      var d = getData(item);
      if (d.segment !== window.BS_SEGMENT) return;
      if (!d.model) return;
      counts[d.model] = (counts[d.model] || 0) + 1;
      if (!labels[d.model]) labels[d.model] = (d.make ? d.make + ' ' : '') + d.model;
    });
    return Object.keys(counts).map(function(m) {
      return { name: m, label: labels[m], count: counts[m] };
    }).sort(function(a, b) {
      return b.count - a.count || a.label.localeCompare(b.label);
    });
  }

  function renderChips() {
    var row = document.getElementById('bsx-chips');
    if (!row) return;
    var models = computeModelCounts();
    if (!models.length) { row.innerHTML = ''; return; }
    var stateModel = window.Bestest.state.model;
    var allOn = !stateModel.length;
    var html = models.map(function(m) {
      var on = allOn || stateModel.indexOf(m.name) !== -1;
      return '<span class="bsx-chip ' + (on ? 'bsx-on' : 'bsx-off') + '" data-model="' + m.name + '">' +
        '<span class="bsx-check">✓</span>' + m.label +
        ' <span class="bsx-ct">' + m.count + '</span>' +
      '</span>';
    }).join('');
    row.innerHTML = html;
    row.querySelectorAll('.bsx-chip').forEach(function(el) {
      el.addEventListener('click', function() {
        toggleChip(el.dataset.model, models);
      });
    });
  }

  function toggleChip(modelName, allModels) {
    var state = window.Bestest.state;
    var allOn = !state.model.length;
    if (allOn) {
      // From "all on" (no filter): first click isolates to just the clicked
      // model rather than excluding it. Matches the conventional faceted-filter
      // mental model (Amazon, KBB, etc.) — a chip = "include this".
      state.model = [modelName];
    } else {
      var idx = state.model.indexOf(modelName);
      if (idx === -1) state.model.push(modelName);
      else state.model.splice(idx, 1);
      // Empty list (deselected the last one) OR everything reselected → back to all-on.
      if (!state.model.length || state.model.length === allModels.length) {
        state.model = [];
      }
    }
    window.Bestest.applyFilters();
    renderChips();
  }

  function checkSticky() {
    var band = document.getElementById('bsx-band');
    var sticky = document.getElementById('bsx-sticky');
    if (!band || !sticky) return;
    var rect = band.getBoundingClientRect();
    var fadeStart = 80;
    var fadeEnd = 0;
    if (rect.bottom <= fadeEnd) {
      sticky.classList.add('bsx-svisible');
      document.body.classList.add('bsx-sticky-on');
    } else if (rect.bottom >= fadeStart) {
      sticky.classList.remove('bsx-svisible');
      document.body.classList.remove('bsx-sticky-on');
    } else {
      sticky.classList.add('bsx-svisible');
      document.body.classList.add('bsx-sticky-on');
    }
  }

  function setupReadMore() {
    var intro = document.querySelector('.srp-intro');
    if (!intro) return;
    var more = document.createElement('button');
    more.className = 'bsx-readmore-toggle';
    more.type = 'button';
    more.textContent = 'more…';
    intro.appendChild(document.createTextNode(' '));
    intro.appendChild(more);
    function checkOverflow() {
      var isMobile = window.matchMedia('(max-width: 720px)').matches;
      if (!isMobile) {
        more.classList.remove('bsx-rm-visible');
        return;
      }
      more.style.display = 'none';
      intro.classList.add('bsx-rm-expanded');
      var fullHeight = intro.scrollHeight;
      intro.classList.remove('bsx-rm-expanded');
      var clampedHeight = intro.clientHeight;
      more.style.display = '';
      if (fullHeight > clampedHeight + 4) {
        more.classList.add('bsx-rm-visible');
      } else {
        more.classList.remove('bsx-rm-visible');
      }
    }
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    more.addEventListener('click', function() {
      intro.classList.add('bsx-rm-expanded');
    });
  }

  function init() {
    if (!buildBand()) {
      setTimeout(init, 200);
      return;
    }
    wirePickerHandlers();
    setupReadMore();
    if (MODE === 'segment') {
      window.Bestest.onReady(function() { renderChips(); });
    }
    window.addEventListener('scroll', checkSticky, { passive: true });
    checkSticky();
  }

  function waitForBestest() {
    if (window.Bestest && typeof window.Bestest.onReady === 'function') {
      init();
    } else {
      setTimeout(waitForBestest, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBestest);
  } else {
    waitForBestest();
  }
})();
