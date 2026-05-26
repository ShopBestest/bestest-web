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
    'Vans': [
      { name: 'Minivan', url: '/used-cars/best-used-minivans', filterValue: 'Minivan', examples: 'Toyota Sienna, Honda Odyssey, Kia Carnival' }
    ],
    'Electric': [
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
    ],
    // displayName overrides the auto-pluralized name in both the picker item and the band title.
    // When present, the band also skips the "The Best Used" prefix (which doesn't fit "The Fun Stuff").
    'The Fun Stuff': [
      { name: 'Fun Cars', displayName: 'The Fun Stuff', url: '/used-cars/fun-cars', filterValue: 'Fun Cars', examples: 'Mustang, Wrangler, GTI, 911, M3, Type R…' }
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
    // displayName, when present, replaces the auto-pluralized name verbatim.
    ACTIVE_PLURAL = ACTIVE.displayName || plural(ACTIVE.name);
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
      // Segments with a displayName (e.g. "The Fun Stuff") suppress the
      // "The Best Used" prefix — it doesn't fit branded segment names.
      var titlePrefix = ACTIVE.displayName ? '' : '<span class="bsx-prefix">The Best Used</span> ';
      band.innerHTML =
        '<div class="bsx-band-inner">' +
          '<p class="bsx-title">' +
            titlePrefix +
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
        var label = s.displayName || plural(s.name);
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
    picker.style.top = (rect.bottom + 6) + 'px';
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
