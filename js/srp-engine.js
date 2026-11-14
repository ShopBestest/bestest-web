(function(){if(document.getElementById('srp-engine-styles'))return;var s=document.createElement('style');s.id='srp-engine-styles';s.textContent=".bs-bar { width: 100%; padding: 8px 0 4px; min-height: 77px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; }\n@media (max-width: 600px) { .bs-bar { min-height: 90px; } }\n.bs-progress { position:fixed; top:0; left:0; right:0; height:3px; background:transparent; z-index:99999; pointer-events:none; opacity:0; transition:opacity .25s ease; overflow:hidden; }\n.bs-progress.bs-show { opacity:1; }\n.bs-progress-fill { height:100%; width:0%; background:#31b56b; transition:width .35s cubic-bezier(.25,.46,.45,.94); box-shadow:0 0 8px rgba(49,181,107,.5); }\n.bs-progress.bs-indeterminate .bs-progress-fill { width:30%; animation:bs-progress-slide 1.4s ease-in-out infinite; transition:none; }\n@keyframes bs-progress-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(400%); } }\n.bs-pills { display:flex; align-items:center; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; }\n.bs-pills::-webkit-scrollbar { display:none; }\n.bs-pw { position:relative; flex-shrink:0; }\n.bs-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border:1px solid #d0d0d0; border-radius:20px; font-size:11px; color:#1a1a1a; background:#fff; white-space:nowrap; cursor:pointer; user-select:none; transition:border-color .15s,background .15s; }\n.bs-pill:hover { border-color:#999; }\n.bs-pill.bs-active { background:#1a1a1a; color:#fff; border-color:#1a1a1a; }\n.bs-meta { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px 14px; line-height:1.4; margin-top:6px; min-height:16px; } @media (max-width: 767px) { .bs-meta { justify-content:space-between; } }\n.bs-count { font-size:11px; color:#6b7280; opacity:0; transition:opacity .2s ease; white-space:nowrap; }\n.bs-count.bs-ready { opacity:1; }\n.bs-clearall { display:none; flex-shrink:0; font-family:inherit; font-size:11px; font-weight:500; line-height:1.15; color:#6b7280; cursor:pointer; background:none; border:none; padding:0 2px 0 0; margin:0; text-align:left; text-decoration:none; white-space:nowrap; }\n.bs-clearall:hover { color:#1a1a1a; }\n.bs-clearall.bs-vis { display:inline-block; }\n.bs-chips { display:contents; }\n.bs-chip { display:inline-flex; align-items:center; gap:5px; flex-shrink:0; padding:5px 11px; border:1px solid #31b56b; background:#e8f5ee; color:#155539; font-family:inherit; font-size:11px; font-weight:600; line-height:normal; border-radius:20px; white-space:nowrap; cursor:pointer; }\n.bs-chip:hover { border-color:#1a6f4a; }\n.bs-chip .bs-chip-x { font-size:10px; line-height:1; }\n.bs-pw.bs-hidden { display:none; }\n.bs-drop { position:fixed; background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:16px; min-width:240px; max-width:320px; z-index:9999; box-shadow:0 4px 16px rgba(0,0,0,.08); display:none; }\n.bs-drop.bs-open { display:block; }\n.bs-drop-segment { min-width:300px; max-width:380px; }\n.bs-drop-title { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; margin:0 0 10px; }\n.bs-opts { display:grid; grid-auto-flow:column; grid-template-columns:1fr 1fr; grid-template-rows:repeat(12,auto); gap:4px 12px; max-height:260px; overflow-y:auto; overflow-x:hidden; }\n@media (max-width:600px){ .bs-opts { grid-template-columns:1fr; grid-template-rows:none; grid-auto-flow:row; } }\n.bs-opts.bs-1col { column-count:1; }\n.bs-opt { display:flex; align-items:flex-start; gap:7px; font-size:13px; color:#1a1a1a; cursor:pointer; padding:3px 0; line-height:1.4; break-inside:avoid; -webkit-column-break-inside:avoid; }\n.bs-opt input { width:14px; height:14px; cursor:pointer; flex-shrink:0; margin-top:2px; accent-color:#1a1a1a; }\n.bs-opt.bs-disabled { opacity:.35; cursor:not-allowed; pointer-events:none; }\n.bs-opt.bs-hidden { display:none; }\n.bs-eg { font-size:11px; color:#6b7280; display:block; }\n.bs-model-group, .bs-seg-group { font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#6b7280; padding:8px 0 4px; border-bottom:1px solid #f0f0f0; margin-bottom:2px; }\n.bs-model-group:first-child, .bs-seg-group:first-child { padding-top:0; }\n.bs-empty-msg { font-size:12px; color:#6b7280; padding:8px 4px; line-height:1.5; }\n.bs-foot { margin-top:12px; display:flex; gap:8px; }\n.bs-apply { flex:1; padding:8px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; }\n.bs-reset { padding:8px 12px; background:none; color:#6b7280; border:1px solid #e0e0e0; border-radius:8px; font-size:13px; cursor:pointer; }\n.bs-sort-opt { padding:9px 10px; font-size:13px; color:#1a1a1a; cursor:pointer; border-radius:6px; transition:background .1s; display:flex; align-items:center; gap:8px; }\n.bs-sort-opt:hover { background:#f5f5f5; }\n.bs-sort-opt.bs-sel { font-weight:600; }\n.bs-sort-opt.bs-sel::before { content:'\\2713  '; }\n.bs-pag { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:32px; padding-bottom:16px; flex-wrap:wrap; width:100%; }\n.bs-pbtn { min-width:36px; height:36px; padding:0 10px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; color:#1a1a1a; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:border-color .15s; }\n.bs-pbtn:hover { border-color:#999; }\n.bs-pbtn.bs-cur { background:#1a1a1a; color:#fff; border-color:#1a1a1a; }\n.bs-pbtn:disabled { opacity:.35; cursor:default; }\n.bs-pbtn.bs-ellipsis { border:none; cursor:default; min-width:20px; }\n.bs-pbtn.bs-ellipsis:hover { border:none; }\n.bs-more { display:block; width:100%; max-width:320px; padding:12px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:14px; color:#1a1a1a; cursor:pointer; margin:24px auto 0; }\n.bs-more:hover { border-color:#999; }\n.w-pagination-wrapper { display:none !important; }\n.bs-total-count { display:none !important; }\n.w-dyn-list { width:100% !important; }\n.w-dyn-items { width:100% !important; min-width:0 !important; grid-template-columns:repeat(3,1fr) !important; }\n@media (max-width:767px) { .w-dyn-items { grid-template-columns:repeat(2,1fr) !important; } }\n@media (max-width:479px) { .w-dyn-items { grid-template-columns:1fr !important; } }\n.w-dyn-item { min-width:0 !important; display:flex !important; flex-direction:column !important; }\n.w-dyn-item.bs-hidden { display:none !important; }\n.car-card { height:100% !important; box-sizing:border-box !important; min-width:0 !important; cursor:pointer !important; }\n.listing-image { aspect-ratio: 4 / 3; object-fit: cover; width: 100%; height: 100%; background: #f0f0f0; }\n.car-card .w-button { width:100% !important; box-sizing:border-box !important; white-space:normal !important; }\n.car-listing-button { background:#1a6f4a !important; }\n";(document.head||document.documentElement).appendChild(s);})();
// Early image hydration for the server-rendered first-page cards: runs immediately on
// script execute (post-HTML-parse via defer). The server markup ships a placeholder SVG in
// the <img> and the real Cloudinary URL in a sibling .hero_image_url text node, so swap the
// real (w_480) URL in NOW and eager/high-priority the first card. This gives a real LCP image
// painting at parse time, before the feed fetch + render pipeline runs.
// 11/14: the templates now ship the real photo in the <img> (bound src + alt), so only the old placeholder
// markup still needs its URL swapped in; a real src is left as served, so the engine's page-1 cards reuse it.
(function(){var items=document.querySelectorAll('.collection-list-2 .w-dyn-item');if(!items.length)return;Array.prototype.forEach.call(items,function(item,idx){var img=item.querySelector('.listing-image');if(!img)return;var placeholder=!img.getAttribute('src')||/placeholder/.test(img.getAttribute('src'));if(placeholder){var urlEl=item.querySelector('.hero_image_url');var url=urlEl?urlEl.textContent.trim():'';if(url)img.src=url.replace(/w_\d+/,'w_480');else if(img.src)img.src=img.src.replace(/w_\d+/,'w_480');}img.decoding='async';if(idx===0){img.loading='eager';img.setAttribute('fetchpriority','high');}else{img.loading='lazy';}});})();
(function(){
  // ── Inventory feed ──────────────────────────────────────────────────────────
  // Single compact JSON of every synced listing, built by build_inventory_json.py and
  // hosted at a stable short-TTL URL. Replaces the old 55-request native-pagination
  // scrape: fetch ONE file, filter/sort in memory, render only the visible page.
  // Cloudflare feed Worker (bestest-inventory-feed, KV-backed, CORS *, 5-min cache).
  // window.BS_FEED_URL lets a staging page point at a staging feed without editing this file.
  var FEED_URL=(typeof window.BS_FEED_URL==='string'&&window.BS_FEED_URL)||'https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/';
  // Preconnect to the feed origin at script-execute (before the inject() setTimeout fires the
  // fetch) so the TLS/connection handshake overlaps the render-blocking CSS/font chain. ~330ms.
  (function(){try{var u=new URL(FEED_URL);var l=document.createElement('link');l.rel='preconnect';l.href=u.origin;l.crossOrigin='anonymous';(document.head||document.documentElement).appendChild(l);}catch(e){}})();
  var CACHE_VERSION='v3', CACHE_TTL_MS=60*60*1000, FEED_CACHE_KEY='bestest_feed_cache_'+CACHE_VERSION;
  var NATIVE_SEGMENT=null, IS_SRP=false, EDITORIAL_OWNS_SEGMENT=false;
  function resolveModeFromWindow(){NATIVE_SEGMENT=typeof window.BS_SEGMENT==='string'&&window.BS_SEGMENT.trim()?window.BS_SEGMENT.trim():null;IS_SRP=!!NATIVE_SEGMENT;EDITORIAL_OWNS_SEGMENT=IS_SRP||!!window.BS_BROAD;}
  resolveModeFromWindow();
  if(!document.querySelector('.collection-list-2'))return;
  var PER_PAGE=24, MOBILE_PER_PAGE=PER_PAGE, BROAD_USED_CARS_PATH='/used-cars';
  // Server card order (Webflow's list: photos updated, newest first), read before any re-render. On the default,
  // unfiltered view page 1 keeps these cars in this order and the server cards stay in place, so the first paint
  // is the settled page (11/14: no card swap, no second photo download; crawlers and shoppers see the same page 1).
  var SERVER_RANK={}, SERVER_COUNT=0, firstRender=true;
  (function(){var seen={};[].forEach.call(document.querySelectorAll('.collection-list-2 .w-dyn-item'),function(it){var a=it.querySelector('a[href^="/used/"]');var h=a&&a.getAttribute('href');if(h&&!(h in seen)){seen[h]=1;SERVER_RANK[h]=SERVER_COUNT++;}});})();
  function cardHref(it){var a=it.querySelector('a[href^="/used/"]');return a?a.getAttribute('href'):'';}
  var SEGMENT_TO_SLUG={'Compact Car':'/used-cars/best-used-compact-cars','Midsize/Full-size Car':'/used-cars/best-used-midsize-cars','Subcompact SUV':'/used-cars/best-used-subcompact-suvs','Compact SUV':'/used-cars/best-used-compact-suvs','Midsize SUV':'/used-cars/best-used-midsize-suvs','Full-Size SUV':'/used-cars/best-used-full-size-suvs','Compact/Midsize Truck':'/used-cars/best-used-midsize-trucks','Full-Size Truck':'/used-cars/best-used-full-size-trucks',Minivan:'/used-cars/best-used-minivans','Electric Vehicles':'/used-cars/best-used-electric-vehicles',Hybrids:'/used-cars/best-used-hybrids','Luxury Small Car':'/used-cars/best-used-luxury-small-cars','Luxury Midsize Car':'/used-cars/best-used-luxury-midsize-cars','Luxury Full-Size Car':'/used-cars/best-used-luxury-full-size-cars','Luxury Subcompact SUV':'/used-cars/best-used-luxury-subcompact-suvs','Luxury Compact SUV':'/used-cars/best-used-luxury-compact-suvs','Luxury Midsize SUV':'/used-cars/best-used-luxury-midsize-suvs','Luxury Full-Size SUV':'/used-cars/best-used-luxury-full-size-suvs'};
  var state={make:[],model:[],segment:[],body_style:[],powertrain:[],price:[],miles:[],year:[],certified:[],page:1,shown:MOBILE_PER_PAGE};
  var sortKey='', defaultSortKey='', allItems=[], filtered=[], bsLock=false, loadComplete=false, hasActiveQuery=false, urlSyncReady=false;
  // SRP streamline (2026-11-05, SRP-STREAMLINE-SPEC): the page's scope (BS_PREFILTER) and the shopper's make / model /
  // powertrain / body-style picks render as active chips (`Toyota ✕`) at the front of the pill row; the pill for a key
  // is hidden while its chip is up. On a scoped landing page any change to the scope (✕, Clear all, a second model)
  // navigates UP to the parent page (the city hub, else /used-cars) with the full query, so URL, H1 and cards agree.
  var CHIP_KEYS=['make','model','powertrain','body_style'];
  var PREFILTER=(window.BS_PREFILTER&&typeof window.BS_PREFILTER==='object')?window.BS_PREFILTER:null;
  function isScoped(){if(!PREFILTER)return false;for(var k in PREFILTER)if(Array.isArray(PREFILTER[k])&&PREFILTER[k].length)return true;return false;}
  function parentPath(){if(typeof window.BS_PARENT_URL==='string'&&window.BS_PARENT_URL)return window.BS_PARENT_URL;if(window.BS_CITY&&window.BS_CITY.slug)return '/best-used/'+window.BS_CITY.slug;return BROAD_USED_CARS_PATH;}
  function chipKeys(){var ks=CHIP_KEYS.slice();if(PREFILTER)for(var k in PREFILTER)if(ks.indexOf(k)===-1&&Array.isArray(PREFILTER[k])&&PREFILTER[k].length)ks.push(k);return ks;}
  function inScope(key,val){return !!(PREFILTER&&Array.isArray(PREFILTER[key])&&PREFILTER[key].indexOf(val)!==-1);}
  function scopeIntact(){if(!PREFILTER)return true;for(var k in PREFILTER){if(!Array.isArray(PREFILTER[k])||!PREFILTER[k].length)continue;if(!arrEq(state[k]||[],PREFILTER[k]))return false;}return true;}
  function fullQuery(){var parts=[];FILTERS.forEach(function(f){if(IS_SRP&&f.key==='segment')return;var vals=state[f.key];if(vals&&vals.length){var p=new URLSearchParams();p.set(f.key,vals.join(','));parts.push(p.toString());}});if(sortKey&&sortKey!==defaultSortKey){var q=new URLSearchParams();q.set('sort',sortKey);parts.push(q.toString());}return parts.length?'?'+parts.join('&'):'';}
  function leaveForParent(){window.location.href=parentPath()+fullQuery();}
  // 'Hybrids' is a virtual segment (a RAV4 Hybrid stays a Compact SUV): it matches by powertrain and navigates to the
  // hybrid SRP, whose page runs in BS_BROAD + BS_PREFILTER mode (2026-10-09).
  var HYBRID_PT=['HEV','Hybrid','PHEV','Plug-in Hybrid','Plug-In Hybrid'];
  var SEGMENT_GROUPS=[
    {label:'SUVs',items:[{v:'Subcompact SUV',eg:'Honda HR-V, Mazda CX-30, Hyundai Kona…'},{v:'Compact SUV',eg:'Toyota RAV4, Honda CR-V, Mazda CX-5…'},{v:'Midsize SUV',eg:'Honda Pilot, Toyota Highlander, Kia Telluride…'},{v:'Full-Size SUV',eg:'Chevy Tahoe, Ford Expedition, Toyota Sequoia…'}]},
    {label:'Cars',items:[{v:'Compact Car',eg:'Toyota Corolla, Honda Civic, Mazda3…'},{v:'Midsize/Full-size Car',eg:'Honda Accord, Toyota Camry, Kia K5…'}]},
    {label:'Trucks',items:[{v:'Compact/Midsize Truck',eg:'Toyota Tacoma, Ford Maverick, Honda Ridgeline…'},{v:'Full-Size Truck',eg:'Ford F-150, Chevy Silverado, Toyota Tundra…'}]},
    {label:'Specialty',items:[{v:'Minivan',eg:'Toyota Sienna, Honda Odyssey, Kia Carnival'},{v:'Electric Vehicles',eg:'Tesla Model Y, BMW iX, Porsche Taycan…'},{v:'Hybrids',eg:'Toyota Prius, RAV4 Hybrid, Honda CR-V Hybrid…',pt:HYBRID_PT}]},
    {label:'Luxury SUVs',items:[{v:'Luxury Subcompact SUV',eg:'BMW X1, Mercedes GLA, Audi Q3…'},{v:'Luxury Compact SUV',eg:'BMW X3, Mercedes GLC, Genesis GV70…'},{v:'Luxury Midsize SUV',eg:'Lexus RX, Audi Q7, BMW X5…'},{v:'Luxury Full-Size SUV',eg:'Cadillac Escalade, Lincoln Navigator, BMW X7…'}]},
    {label:'Luxury Cars',items:[{v:'Luxury Small Car',eg:'Audi A4, BMW 3 Series, Mercedes C-Class…'},{v:'Luxury Midsize Car',eg:'Mercedes E-Class, Audi A6, BMW 5 Series…'},{v:'Luxury Full-Size Car',eg:'BMW 7 Series, Mercedes S-Class, Lexus LS…'}]}
  ];
  var SEGMENT_OPTS=(function(){var out=[];SEGMENT_GROUPS.forEach(function(g){g.items.forEach(function(i){out.push(i.pt?{v:i.v,eg:i.eg,pt:i.pt}:{v:i.v,eg:i.eg});});});return out;})();
  // Main /used-cars + segment SRP filter config.
  // Banned nameplates (Solterra, bZ4X, Prologue, CX-9, Model X, Cybertruck)
  // deliberately omitted — Exclusions enforces the ban and hideEmpty:true would
  // hide them anyway since their inventory count is 0.
  var MAIN_MAKES=[{v:'Acura'},{v:'Audi'},{v:'BMW'},{v:'Cadillac'},{v:'Chevrolet'},{v:'Ford'},{v:'GMC'},{v:'Genesis'},{v:'Honda'},{v:'Hyundai'},{v:'Infiniti'},{v:'Jeep'},{v:'Kia'},{v:'Lexus'},{v:'Lincoln'},{v:'Mazda'},{v:'Mercedes-Benz'},{v:'Nissan'},{v:'Porsche'},{v:'Ram'},{v:'Subaru'},{v:'Tesla'},{v:'Toyota'},{v:'Volvo'}];
  // Body-style label "Car" (formerly "Sedan") lumps sedans + hatchbacks + coupes + convertibles + targas on main pages.
  var MAIN_BODY=[{v:'SUV',match:['SUV','Wagon']},{v:'Car',match:['Sedan','Hatchback','Coupe','Convertible','Targa']},{v:'Truck',match:['Pickup']},{v:'Minivan',match:['Minivan']}];
  var MAIN_MODELS_BY_MAKE={Acura:['Integra','MDX','RDX','TLX'],Audi:['A4','A6','A7','A8','Q3','Q5','Q7','Q8','Q8 Sportback e-tron','e-tron GT'],BMW:['2 Series','3 Series','4 Series','5 Series','7 Series','8 Series','X1','X2','X3','X4','X5','X6','X7','iX'],Cadillac:['Escalade'],Chevrolet:['Bolt EUV','Silverado 1500','Suburban','Tahoe'],Ford:['Bronco','Expedition','F-150','Maverick','Mustang Mach-E'],GMC:['Sierra 1500','Yukon','Yukon XL'],Genesis:['G70','GV60','GV70','GV80'],Honda:['Accord','CR-V','Civic','HR-V','Odyssey','Passport','Pilot','Ridgeline'],Hyundai:['Elantra','Ioniq 5','Ioniq 6','Kona','Palisade','Santa Cruz','Santa Fe','Sonata','Tucson'],Infiniti:['QX60'],Jeep:['Gladiator'],Kia:['Carnival','EV6','EV9','K5','Niro','Seltos','Sorento','Soul','Sportage','Telluride'],Lexus:['ES','GX','IS','LS','LX','NX','RX','TX','UX'],Lincoln:['Navigator'],Mazda:['CX-30','CX-5','CX-50','CX-90','Mazda3'],'Mercedes-Benz':['CLE','E-Class','EQB','G-Class','GLA','GLB','GLC','GLE','GLS','S-Class','SL'],Nissan:['Altima','Ariya','Frontier'],Porsche:['Cayenne','Macan','Panamera','Taycan'],Ram:['1500'],Subaru:['Crosstrek','Forester','Legacy','Outback'],Tesla:['Model 3','Model S','Model Y'],Toyota:['4Runner','Camry','Corolla','Corolla Cross','Crown','Grand Highlander','Highlander','Prius','RAV4','Sequoia','Sienna','Tacoma','Tundra','Venza'],Volvo:['XC60']};
  var FILTERS=[];
  FILTERS.push({key:'segment',label:'Segment',col:1,opts:SEGMENT_OPTS});
  // hideEmpty: true on a filter hides options with zero matches in the current
  // (post-filter) inventory rather than just greying them out. Reserved for
  // inventory-derived dimensions (make/model/body/year) where editorial taxonomy
  // doesn't matter. Range filters (price/miles) and fixed taxonomies
  // (powertrain/segment) keep the existing grey-out behavior.
  FILTERS.push(
    {key:'make',label:'Make',col:2,opts:MAIN_MAKES,hideEmpty:true},
    {key:'model',label:'Model',col:2,dynamic:true,opts:[],hideEmpty:true},
    {key:'body_style',label:'Body Style',col:1,dataKey:'body_type',opts:MAIN_BODY,hideEmpty:true},
    // powertrain_type in the feed carries BOTH raw Marketcheck codes (HEV/PHEV/BEV) and
    // pipeline-normalized values (Hybrid/EV) depending on the record, so each option
    // matches both spellings. Mild hybrids (MHEV) intentionally match no electrified
    // filter — they behave like Combustion for shopper intent.
    {key:'powertrain',label:'Powertrain',col:1,opts:[{v:'HEV',label:'Hybrid',match:['HEV','Hybrid']},{v:'PHEV',label:'Plug-in Hybrid',match:['PHEV','Plug-in Hybrid','Plug-In Hybrid']},{v:'BEV',label:'Electric',match:['BEV','EV']}]},
    // Price bands are $5k wide where inventory is densest ($20k–$40k); options stack.
    // Old 10k-band values in shared links are mapped onto these in LEGACY_PRICE.
    {key:'price',label:'Price',col:1,range:true,opts:[{v:'0-20000',label:'Under $20k'},{v:'20000-25000',label:'$20k – $25k'},{v:'25000-30000',label:'$25k – $30k'},{v:'30000-35000',label:'$30k – $35k'},{v:'35000-40000',label:'$35k – $40k'},{v:'40000-50000',label:'$40k – $50k'},{v:'50000-999999',label:'$50k+'}]},
    {key:'miles',label:'Mileage',col:1,range:true,opts:[{v:'0-20000',label:'Under 20k'},{v:'20000-30000',label:'20k – 30k'},{v:'30000-40000',label:'30k – 40k'},{v:'40000-50000',label:'40k – 50k'}]},
    {key:'year',label:'Year',col:1,opts:[{v:'2024'},{v:'2023'},{v:'2022'},{v:'2021'}],hideEmpty:true},
    // Manufacturer-certified only: the feed sets cpo=1 when Marketcheck flags the car
    // certified AND the dealer is franchised for its make (pipeline cpo_rules.py), so
    // a Ford store's "Blue Certified" Toyota doesn't count.
    {key:'certified',label:'Certified',col:1,opts:[{v:'cpo',label:'Certified pre-owned'}]}
  );
  var LEGACY_PRICE={'10000-20000':['0-20000'],'20000-30000':['20000-25000','25000-30000'],'30000-40000':['30000-35000','35000-40000']};
  var MODELS_BY_MAKE=MAIN_MODELS_BY_MAKE;
  var ALL_MODELS=(function(){var seen={};Object.keys(MODELS_BY_MAKE).forEach(function(make){MODELS_BY_MAKE[make].forEach(function(model){seen[model]=true;});});return Object.keys(seen);})();
  var MAKES_BY_MODEL=(function(){var map={};Object.keys(MODELS_BY_MAKE).forEach(function(make){MODELS_BY_MAKE[make].forEach(function(model){if(!map[model])map[model]=[];map[model].push(make);});});return map;})();
  var CHEVRON='<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var SORTS=[{v:'distance-asc',label:'Distance: Nearest',short:'Nearest'},{v:'price-asc',label:'Price: Low → High',short:'Price ↑'},{v:'price-desc',label:'Price: High → Low',short:'Price ↓'},{v:'year-desc',label:'Year: Newest First',short:'Year ↓'},{v:'year-asc',label:'Year: Oldest First',short:'Year ↑'},{v:'miles-asc',label:'Mileage: Low → High',short:'Miles ↑'}];
  // Static trust-badge row — identical on every server-rendered card, so it's reproduced verbatim.
  var BADGE_TEXT='Recommended ✅ Model ✅ Dealer ✅ Listing';
  function expandFilterValues(filter,vals){if(!filter||!vals||!vals.length)return vals||[];if(!filter.opts.some(function(o){return o.match;}))return vals;return vals.reduce(function(acc,v){var opt=null;for(var i=0;i<filter.opts.length;i++){if(filter.opts[i].v===v){opt=filter.opts[i];break;}}if(opt&&opt.match)opt.match.forEach(function(m){if(acc.indexOf(m)===-1)acc.push(m);});else if(acc.indexOf(v)===-1)acc.push(v);return acc;},[]);}
  function optLabel(f,v){for(var i=0;i<f.opts.length;i++)if(f.opts[i].v===v)return f.opts[i].label||v;return v;}
  function getFilterByKey(k){for(var i=0;i<FILTERS.length;i++)if(FILTERS[i].key===k)return FILTERS[i];return null;}
  // ── Feed record → internal data shape ───────────────────────────────────────
  // Compact keys from build_inventory_json.py: id y mk md tr p mi pt sg bd dn dc la ln img slug pho pm t
  function mapRecord(r){
    var year=r.y!=null?String(r.y):'';
    var img=r.img||'';
    return {
      make:r.mk||'', model:r.md||'', year:year, yearNum:parseInt(r.y)||0,
      powertrain:r.pt||'', segment:r.sg||'', body_type:r.bd||'',
      price:typeof r.p==='number'?r.p:(parseInt(r.p)||0),
      miles:typeof r.mi==='number'?r.mi:(parseInt(r.mi)||0),
      photoCount:typeof r.pho==='number'?r.pho:(parseInt(r.pho)||0),
      photosModifiedTime:r.pm?(new Date(r.pm).getTime()||0):0,
      lat:(typeof r.la==='number')?r.la:(r.la?parseFloat(r.la):null),
      lng:(typeof r.ln==='number')?r.ln:(r.ln?parseFloat(r.ln):null),
      city:r.dc||'', trim:r.tr||'', dealer:r.dn||'', certified:r.cpo?'cpo':'',
      // days since the car entered the feed (fs = first_seen date), or null
      fsDays:r.fs?Math.max(0,Math.floor((Date.now()-(new Date(r.fs).getTime()||Date.now()))/86400000)):null,
      img:img, imgSmall:img.replace(/w_\d+/,'w_480'),
      href:r.slug?'/used/'+r.slug:'#',
      title:r.t||(year+' '+(r.mk||'')+' '+(r.md||'')).trim()
    };
  }
  // Identity — `filtered`/`allItems` now hold data records directly (no DOM scrape),
  // so the filter/sort/availability code that calls getData() works unchanged.
  function getData(rec){return rec;}
  function readURLParams(){
    var params=new URLSearchParams(window.location.search);
    function parseListParam(key,validValues){var raw=params.get(key);if(!raw)return [];var values=raw.split(',').map(function(v){return v.trim();}).filter(Boolean);if(key==='price')values=values.reduce(function(acc,v){(LEGACY_PRICE[v]||[v]).forEach(function(x){if(acc.indexOf(x)===-1)acc.push(x);});return acc;},[]);if(validValues)values=values.filter(function(v){return validValues.indexOf(v)!==-1;});return values;}
    var filterValidValues={};
    FILTERS.forEach(function(f){filterValidValues[f.key]=f.opts.map(function(o){return o.v;});});
    filterValidValues.model=ALL_MODELS;
    state.make=parseListParam('make',filterValidValues.make);
    state.model=parseListParam('model',filterValidValues.model);
    state.body_style=parseListParam('body_style',filterValidValues.body_style);
    state.powertrain=parseListParam('powertrain',filterValidValues.powertrain);
    state.price=parseListParam('price',filterValidValues.price);
    state.miles=parseListParam('miles',filterValidValues.miles);
    state.year=parseListParam('year',filterValidValues.year);
    state.certified=parseListParam('certified',filterValidValues.certified);
    if(IS_SRP)state.segment=[NATIVE_SEGMENT]; else state.segment=parseListParam('segment',filterValidValues.segment);
    // Combo pages (make+city, model+city, body+city) seed their defining facet from
    // window.BS_PREFILTER so a clean path like /used-cars/toyota/rav4/irvine pre-filters
    // with no query string. URL params, when present, take precedence.
    if(window.BS_PREFILTER){
      ['make','model','body_style','powertrain','price','miles','year','certified'].forEach(function(k){
        var pv=window.BS_PREFILTER[k];
        if(Array.isArray(pv)&&pv.length&&(!state[k]||!state[k].length))state[k]=pv.slice();
      });
    }
    var rawSort=params.get('sort');
    // City/combo pages (window.BS_CITY) default to nearest-first; everything else default order.
    var cityDefault=(window.BS_CITY&&typeof window.BS_CITY.lat==='number')?'distance-asc':'';
    defaultSortKey=cityDefault;
    if(rawSort){var validSorts=SORTS.map(function(s){return s.v;});sortKey=validSorts.indexOf(rawSort)!==-1?rawSort:cityDefault;} else sortKey=cityDefault;
  }
  function arrEq(a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;var x=a.slice().sort(),y=b.slice().sort();for(var i=0;i<x.length;i++)if(x[i]!==y[i])return false;return true;}
  function buildQueryString(){
    var parts=[];
    FILTERS.forEach(function(f){
      if(IS_SRP&&f.key==='segment')return;
      // Keep the combo page's defining facet out of the URL while it equals the prefilter;
      // once the user changes it, it deep-links like any other filter.
      if(window.BS_PREFILTER&&arrEq(state[f.key],window.BS_PREFILTER[f.key]))return;
      var vals=state[f.key];
      if(vals&&vals.length){var p=new URLSearchParams();p.set(f.key,vals.join(','));parts.push(p.toString());}
    });
    if(sortKey&&sortKey!==defaultSortKey){var p=new URLSearchParams();p.set('sort',sortKey);parts.push(p.toString());}   // the page default sort is not a query
    return parts.length?'?'+parts.join('&'):'';
  }
  function syncStateToURL(){if(!urlSyncReady)return;var qs=buildQueryString();var newUrl=window.location.pathname+qs+window.location.hash;if(newUrl!==window.location.pathname+window.location.search+window.location.hash)window.history.replaceState(null,'',newUrl);}
  function syncCheckboxesToState(){
    FILTERS.forEach(function(f){var checked=state[f.key]||[];document.querySelectorAll('#bsd-'+f.key+' input').forEach(function(cb){cb.checked=checked.indexOf(cb.value)!==-1;});});
    document.querySelectorAll('.bs-sort-opt').forEach(function(el){el.classList.toggle('bs-sel',el.dataset.sort===sortKey);});
  }
  function buildSegmentURL(basePath){
    var params=new URLSearchParams();
    if(state.make.length)params.set('make',state.make.join(','));
    if(state.model.length)params.set('model',state.model.join(','));
    if(state.body_style.length)params.set('body_style',state.body_style.join(','));
    if(state.powertrain.length)params.set('powertrain',state.powertrain.join(','));
    if(state.price.length)params.set('price',state.price.join(','));
    if(state.miles.length)params.set('miles',state.miles.join(','));
    if(state.year.length)params.set('year',state.year.join(','));
    if(state.certified.length)params.set('certified',state.certified.join(','));
    if(sortKey)params.set('sort',sortKey);
    var qs=params.toString();
    return qs?basePath+'?'+qs:basePath;
  }
  function segMatch(d){if(matchList(d.segment,state.segment))return true;return state.segment.indexOf('Hybrids')!==-1&&HYBRID_PT.indexOf(d.powertrain)!==-1;}
  function resolveSegmentNavigation(segmentNames){
    if(!segmentNames||segmentNames.length===0){if(window.location.pathname===BROAD_USED_CARS_PATH)return null;return buildSegmentURL(BROAD_USED_CARS_PATH);}
    if(segmentNames.length===1){var seg=segmentNames[0];if(NATIVE_SEGMENT===seg)return null;var slug=SEGMENT_TO_SLUG[seg];if(slug)return buildSegmentURL(slug);var fallback=buildSegmentURL(BROAD_USED_CARS_PATH);fallback+=(fallback.indexOf('?')===-1?'?':'&')+'segment='+encodeURIComponent(seg);return fallback;}
    var multi=buildSegmentURL(BROAD_USED_CARS_PATH);
    multi+=(multi.indexOf('?')===-1?'?':'&')+'segment='+encodeURIComponent(segmentNames.join(','));
    return multi;
  }
  function getInventoryGrid(){return document.querySelector('.collection-list-2');}
  function getInventoryList(){var grid=getInventoryGrid();return grid?grid.closest('.w-dyn-list'):null;}
  function escAttr(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function escHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function fmtPrice(n){return n>0?'$'+n.toLocaleString('en-US',{maximumFractionDigits:0}):'';}
  function fmtMiles(n){return n>0?n.toLocaleString('en-US',{maximumFractionDigits:0})+' mi':'';}
  // ── Card construction ───────────────────────────────────────────────────────
  // Mirrors the live Webflow card markup verbatim so distance.js (.car-card data-attrs),
  // styles, and any downstream JS keep working. Trust-badge row is the static BADGE_TEXT.
  // 11/14: cards use the feed's own photo URL (w_640), the same one the template's <img> serves, so a re-render
  // hits the browser cache instead of downloading a second size (and Cloudinary builds one version per car).
  function cardHTML(d){
    var heading=(d.year+' '+d.make+' '+d.model).replace(/\s+/g,' ').trim();
    var full=(heading+' '+(d.trim||'')).trim();
    return '<div role="listitem" class="w-dyn-item">'+
      '<div data-body-type="'+escAttr(d.body_type)+'" data-dealer-city="'+escAttr(d.city)+'" data-dealer-lat="'+(d.lat!=null?d.lat:'')+'" data-dealer-lng="'+(d.lng!=null?d.lng:'')+'" data-photo-count="'+(d.photoCount||0)+'" class="car-card">'+
        '<a href="'+escAttr(d.href)+'" aria-label="'+escAttr('View '+full)+'" class="listing-image-wrapper w-inline-block">'+
          '<img src="'+escAttr(d.img||d.imgSmall)+'" loading="lazy" decoding="async" alt="'+escAttr(full)+'" class="listing-image"/>'+
        '</a>'+
        '<div class="car-listing-name-wrapper">'+
          '<h3 class="heading">'+escHtml(heading)+'</h3>'+
          '<div class="div-block-10"><div class="text-block-2">'+escHtml(d.trim)+'</div><div class="text-block-14">•</div><div class="miles">'+escHtml(fmtMiles(d.miles))+'</div></div>'+
          
          '<div class="price">'+escHtml(fmtPrice(d.price))+'</div>'+
          '<div class="div-block-11"><a href="'+escAttr(d.href)+'" aria-label="'+escAttr('See listing: '+full)+'" class="primary-button car-listing-button w-button">See listing</a><div class="text-block-7">'+BADGE_TEXT+'</div></div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }
  function buildHTML(){
    var pillsHTML=FILTERS.map(function(f){
      if(EDITORIAL_OWNS_SEGMENT&&f.key==='segment')return '';
      // Segment SRPs use the chip row for model filtering, so make/model/body
      // pills are hidden there.
      if(IS_SRP&&(f.key==='make'||f.key==='model'||f.key==='body_style'))return '';
      var optsHTML=f.opts.map(function(o){
        var lbl=o.label||o.v;
        var eg=o.eg?'<span class="bs-eg">e.g. '+o.eg+'</span>':'';
        var checked=state[f.key].indexOf(o.v)!==-1?' checked':'';
        return '<label class="bs-opt"><input type="checkbox" data-key="'+f.key+'" value="'+o.v+'"'+checked+'> <span>'+lbl+eg+'</span></label>';
      }).join('');
      return ['<div class="bs-pw">','<div class="bs-pill" data-f="'+f.key+'" id="bsp-'+f.key+'">',f.label,' '+CHEVRON,'</div>','<div class="bs-drop" id="bsd-'+f.key+'">','<p class="bs-drop-title">'+f.label+'</p>','<div class="bs-opts'+(f.col===1?' bs-1col':'')+'">'+optsHTML+'</div>','<div class="bs-foot">','<button class="bs-reset" data-f="'+f.key+'">Clear</button>','<button class="bs-apply" data-f="'+f.key+'">Apply</button>','</div>','</div>','</div>'].join('');
    }).join('');
    var sortOptsHTML=SORTS.map(function(s){var sel=s.v===sortKey?' bs-sel':'';return '<div class="bs-sort-opt'+sel+'" data-sort="'+s.v+'">'+s.label+'</div>';}).join('');
    var sortPillHTML=['<div class="bs-pw">','<div class="bs-pill" data-f="sort" id="bsp-sort">','Sort ',CHEVRON,'</div>','<div class="bs-drop" id="bsd-sort">','<p class="bs-drop-title">Sort by</p>','<div class="bs-opts bs-1col">'+sortOptsHTML+'</div>','<div class="bs-foot">','<button class="bs-reset" data-f="sort">Clear sort</button>','</div>','</div>','</div>'].join('');
    // Pill row: `Clear`/`all` (two lines, only while something is active), then the scope/shopper chips, then the pills.
    // Meta row: `{N} Bestest listings` left; zip-pill.js adds `📍 {City}` on the right. Nothing else.
    return ['<div class="bs-bar" id="bs-bar">','<div class="bs-pills">','<button class="bs-clearall" id="bs-clearall" type="button" aria-label="Clear all filters">Clear<br>all</button>','<span class="bs-chips" id="bs-chips"></span>'+pillsHTML+sortPillHTML+'</div>','<div class="bs-meta">','<span class="bs-count" id="bs-count"></span>','</div>','</div>'].join('');
  }
  function refilterPreservingState(){
    hasActiveQuery=isQueryActive();
    var bodyVals=expandFilterValues(getFilterByKey('body_style'),state.body_style);
    var ptVals=expandFilterValues(getFilterByKey('powertrain'),state.powertrain);
    var base=allItems.filter(function(d){
      return matchList(d.make,state.make) && matchList(d.model,state.model) && segMatch(d) && matchList(d.body_type,bodyVals) && matchList(d.powertrain,ptVals) && matchRange(d.price,state.price) && matchRange(d.miles,state.miles) && matchList(d.year,state.year) && matchList(d.certified,state.certified);
    });
    filtered=sortItems(base);
  }
  function matchList(val,list){return !list.length||list.indexOf(val)!==-1;}
  function matchRange(val,ranges){if(!ranges.length)return true;return ranges.some(function(r){var p=r.split('-');return val>=parseInt(p[0])&&val<=parseInt(p[1]);});}
  function haversineMiles(lat1,lng1,lat2,lng2){var R=3958.8,toRad=function(d){return d*Math.PI/180;};var dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1);var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)*Math.sin(dLng/2);return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
  // Distance-sort origin: city centroid on city/combo pages (window.BS_CITY), else the
  // visitor's resolved zip lat/lng from distance.js. null ⇒ fall back to default order.
  function getSortOrigin(){
    if(window.BS_CITY&&typeof window.BS_CITY.lat==='number'&&typeof window.BS_CITY.lng==='number')return {lat:window.BS_CITY.lat,lng:window.BS_CITY.lng};
    if(window.BestestDistance&&typeof window.BestestDistance.getUserLatLng==='function'){var u=window.BestestDistance.getUserLatLng();if(u&&typeof u.lat==='number'&&typeof u.lng==='number')return u;}
    return null;
  }
  function defaultSort(pairs){var useServer=SERVER_COUNT>0&&!isQueryActive();pairs.sort(function(a,b){if(useServer){var ra=SERVER_RANK[a.data.href],rb=SERVER_RANK[b.data.href],ia=ra!==undefined,ib=rb!==undefined;if(ia&&ib)return ra-rb;if(ia!==ib)return ia?-1:1;}var aRich=a.data.photoCount>=15?1:0;var bRich=b.data.photoCount>=15?1:0;if(aRich!==bRich)return bRich-aRich;return b.data.photosModifiedTime-a.data.photosModifiedTime;});}
  function sortItems(items){
    var pairs=items.map(function(rec){return {item:rec,data:rec};});
    if(sortKey==='distance-asc'){
      var origin=getSortOrigin();
      // On a city/combo page, listings physically IN the page's city rank first
      // (then by distance), so the city's own dealers lead page 1.
      var cityName=(window.BS_CITY&&window.BS_CITY.name)?String(window.BS_CITY.name).toLowerCase():null;
      if(origin){
        pairs.forEach(function(p){var d=p.data;p._dist=(d.lat!=null&&d.lng!=null)?haversineMiles(origin.lat,origin.lng,d.lat,d.lng):Infinity;p._inCity=(cityName&&d.city&&d.city.toLowerCase()===cityName)?0:1;});
        pairs.sort(function(a,b){if(a._inCity!==b._inCity)return a._inCity-b._inCity;if(a._dist!==b._dist)return a._dist-b._dist;return b.data.photosModifiedTime-a.data.photosModifiedTime;});
        return pairs.map(function(p){return p.item;});
      }
      defaultSort(pairs);
      return pairs.map(function(p){return p.item;});
    }
    if(sortKey){
      pairs.sort(function(a,b){
        switch(sortKey){
          case 'price-asc': return a.data.price-b.data.price;
          case 'price-desc': return b.data.price-a.data.price;
          case 'year-desc': return b.data.yearNum-a.data.yearNum;
          case 'year-asc': return a.data.yearNum-b.data.yearNum;
          case 'miles-asc': return a.data.miles-b.data.miles;
          default: return 0;
        }
      });
    } else {
      defaultSort(pairs);
    }
    return pairs.map(function(p){return p.item;});
  }
  function isQueryActive(){for(var i=0;i<FILTERS.length;i++){if(IS_SRP&&FILTERS[i].key==='segment')continue;if(state[FILTERS[i].key].length)return true;}return false;}
  function applyFilters(){if(isScoped()&&!scopeIntact()){leaveForParent();return;}refilterPreservingState();state.page=1;state.shown=MOBILE_PER_PAGE;syncStateToURL();render();}
  function computeAvailability(targetFilterKey){
    var bodyValsForFilter=targetFilterKey==='body_style'?[]:expandFilterValues(getFilterByKey('body_style'),state.body_style);
    var ptValsForFilter=targetFilterKey==='powertrain'?[]:expandFilterValues(getFilterByKey('powertrain'),state.powertrain);
    var base=allItems.filter(function(d){
      var modelConstraint=(targetFilterKey==='make'||targetFilterKey==='model')?true:matchList(d.model,state.model);
      return (targetFilterKey==='make'||matchList(d.make,state.make)) && modelConstraint && (targetFilterKey==='segment'||segMatch(d)) && (targetFilterKey==='body_style'||matchList(d.body_type,bodyValsForFilter)) && (targetFilterKey==='powertrain'||matchList(d.powertrain,ptValsForFilter)) && (targetFilterKey==='price'||matchRange(d.price,state.price)) && (targetFilterKey==='miles'||matchRange(d.miles,state.miles)) && (targetFilterKey==='year'||matchList(d.year,state.year)) && (targetFilterKey==='certified'||matchList(d.certified,state.certified));
    });
    var filter=getFilterByKey(targetFilterKey);
    if(!filter)return {};
    var optsToCheck=filter.opts;
    if(targetFilterKey==='model')optsToCheck=computeVisibleModels().map(function(m){return {v:m};});
    var availability={};
    optsToCheck.forEach(function(opt){
      var hit=false;
      var matchVals=opt.match||[opt.v];
      for(var j=0;j<base.length;j++){
        var d=base[j];
        if(filter.range){
          var p=opt.v.split('-'), lo=parseInt(p[0]), hi=parseInt(p[1]);
          var val=targetFilterKey==='price'?d.price:d.miles;
          if(val>=lo&&val<=hi){hit=true;break;}
        } else {
          var val=targetFilterKey==='make'?d.make:targetFilterKey==='model'?d.model:targetFilterKey==='segment'?d.segment:targetFilterKey==='body_style'?d.body_type:targetFilterKey==='powertrain'?d.powertrain:targetFilterKey==='year'?d.year:targetFilterKey==='certified'?d.certified:null;
          if(opt.pt){if(opt.pt.indexOf(d.powertrain)!==-1){hit=true;break;}}
          else if(matchVals.indexOf(val)!==-1){hit=true;break;}
        }
      }
      availability[opt.v]=hit;
    });
    return availability;
  }
  function computeVisibleModels(){if(!state.make.length)return [];var seen={},out=[];state.make.forEach(function(make){var models=MODELS_BY_MAKE[make]||[];models.forEach(function(m){if(!seen[m]){seen[m]=true;out.push(m);}});});out.sort();return out;}
  function buildMakeDropdownContent(){var drop=document.getElementById('bsd-make');if(!drop)return;var optsContainer=drop.querySelector('.bs-opts');if(!optsContainer)return;optsContainer.querySelectorAll('input').forEach(function(cb){cb.checked=state.make.indexOf(cb.value)!==-1;});}
  function buildModelDropdownContent(){
    var drop=document.getElementById('bsd-model');if(!drop)return;var optsContainer=drop.querySelector('.bs-opts');if(!optsContainer)return;
    if(!state.make.length){optsContainer.innerHTML='<div class="bs-empty-msg">Choose a make first to filter by model.</div>';return;}
    var makesSorted=state.make.slice().sort(), html='';
    makesSorted.forEach(function(make){
      var models=(MODELS_BY_MAKE[make]||[]).slice().sort();
      if(!models.length)return;
      if(makesSorted.length>1)html+='<div class="bs-model-group">'+make+'</div>';
      models.forEach(function(model){var checked=state.model.indexOf(model)!==-1?' checked':'';html+='<label class="bs-opt"><input type="checkbox" data-key="model" value="'+model+'"'+checked+'> <span>'+model+'</span></label>';});
    });
    optsContainer.innerHTML=html;
  }
  function updateDropdownAvailability(filterKey){if(filterKey==='sort')return;if(IS_SRP&&filterKey==='segment')return;var availability=computeAvailability(filterKey);var drop=document.getElementById('bsd-'+filterKey);if(!drop)return;var filter=getFilterByKey(filterKey);var hideEmpty=filter&&filter.hideEmpty;drop.querySelectorAll('.bs-opt').forEach(function(label){var cb=label.querySelector('input');if(!cb)return;var val=cb.value;var available=availability[val];var show=cb.checked||available;if(hideEmpty){if(show){label.classList.remove('bs-hidden');label.classList.remove('bs-disabled');}else{label.classList.add('bs-hidden');}}else{if(show)label.classList.remove('bs-disabled');else label.classList.add('bs-disabled');}});}
  // Derive Make/Model options from the live feed so the filters show ALL and ONLY
  // nameplates with >=1 live listing. Falls back to the hardcoded MAIN_* lists if the
  // feed is empty/unavailable. Broad /used-cars only — segment SRPs filter models via
  // the chip row, not these pills.
  function deriveFromFeed(){
    var mk={},mbm={};
    allItems.forEach(function(d){if(!d.make)return;mk[d.make]=true;if(d.model){(mbm[d.make]=mbm[d.make]||{})[d.model]=true;}});
    var makes=Object.keys(mk).sort(),modelsByMake={};
    makes.forEach(function(m){modelsByMake[m]=Object.keys(mbm[m]||{}).sort();});
    return {makes:makes,modelsByMake:modelsByMake};
  }
  function applyDynamicMakeModel(){
    if(IS_SRP)return;
    var d=deriveFromFeed();
    if(!d.makes.length)return; // keep hardcoded fallback when the feed didn't load
    MODELS_BY_MAKE=d.modelsByMake;
    ALL_MODELS=(function(){var s={};d.makes.forEach(function(m){d.modelsByMake[m].forEach(function(x){s[x]=true;});});return Object.keys(s);})();
    MAKES_BY_MODEL=(function(){var map={};d.makes.forEach(function(m){d.modelsByMake[m].forEach(function(x){(map[x]=map[x]||[]).push(m);});});return map;})();
    var mf=getFilterByKey('make');if(mf)mf.opts=d.makes.map(function(v){return {v:v};});
    var drop=document.getElementById('bsd-make');
    if(drop){var oc=drop.querySelector('.bs-opts');if(oc)oc.innerHTML=d.makes.map(function(m){var c=state.make.indexOf(m)!==-1?' checked':'';return '<label class="bs-opt"><input type="checkbox" data-key="make" value="'+escAttr(m)+'"'+c+'> <span>'+escHtml(m)+'</span></label>';}).join('');}
  }
  // ── Feed load ───────────────────────────────────────────────────────────────
  function readFeedCache(){try{var raw=sessionStorage.getItem(FEED_CACHE_KEY);if(!raw)return null;var p=JSON.parse(raw);if(!p||!p.timestamp||!p.records)return null;if(Date.now()-p.timestamp>CACHE_TTL_MS){sessionStorage.removeItem(FEED_CACHE_KEY);return null;}return p.records;}catch(e){return null;}}
  function writeFeedCache(records){try{sessionStorage.setItem(FEED_CACHE_KEY,JSON.stringify({timestamp:Date.now(),records:records}));}catch(e){}}
  function loadFeed(){
    var cached=readFeedCache();
    if(cached){onFeed(cached);return;}
    showProgress();
    fetch(FEED_URL,{credentials:'omit'}).then(function(r){if(!r.ok)throw new Error('feed '+r.status);return r.json();}).then(function(records){
      if(!Array.isArray(records)||!records.length)throw new Error('empty feed');
      writeFeedCache(records);
      onFeed(records);
    }).catch(function(){
      // Feed unavailable — leave the server-rendered first-page cards in place so the
      // page still shows inventory; just no client-side filter/sort.
      hideProgress();
      loadComplete=true;fullReady();
    });
  }
  function onFeed(records){
    allItems=records.map(mapRecord);
    applyDynamicMakeModel();
    loadComplete=true;
    hideProgress();
    fullReady();
  }
  var feedReady=false;
  function fullReady(){feedReady=true;refilterPreservingState();render();}
  function ensureProgressEl(){var el=document.getElementById('bs-progress');if(el)return el;el=document.createElement('div');el.id='bs-progress';el.className='bs-progress bs-indeterminate';el.innerHTML='<div class="bs-progress-fill" id="bs-progress-fill"></div>';document.body.appendChild(el);return el;}
  function showProgress(){var el=ensureProgressEl();el.offsetHeight;el.classList.add('bs-show');}
  function hideProgress(){var el=document.getElementById('bs-progress');if(!el)return;el.classList.remove('bs-show');}
  function inject(){
    var dynList=getInventoryList();
    if(!dynList)return;
    if(document.getElementById('bs-bar'))return;
    resolveModeFromWindow();
    PER_PAGE=24;MOBILE_PER_PAGE=PER_PAGE;
    state.shown=MOBILE_PER_PAGE;
    readURLParams();
    dynList.insertAdjacentHTML('beforebegin',buildHTML());
    setup();
    urlSyncReady=true;
    loadFeed();
  }
  function render(){
    var mobile=window.innerWidth<768, container=getInventoryGrid();
    if(!container)return;
    if(!feedReady)return; // keep server-rendered cards until the feed is in
    var visible;
    if(mobile)visible=filtered.slice(0,state.shown);
    else {var s=(state.page-1)*PER_PAGE;visible=filtered.slice(s,s+PER_PAGE);}
    var keep=false;
    // First render only, page 1, the page's own default sort (city pages: nearest to the city centre, which is the
    // order the template's list is already in): keep the server cards when they are exactly this page. The card-by-card
    // href check is the guard, so a shared link with filters or a different sort still renders fresh (11/14).
    if(firstRender&&sortKey===defaultSortKey&&state.page===1&&visible.length){
      var server=container.querySelectorAll('.w-dyn-item');
      if(server.length>=visible.length){keep=true;for(var k=0;k<visible.length;k++){if(cardHref(server[k])!==visible[k].href){keep=false;break;}}}
      if(keep)for(var x=server.length-1;x>=visible.length;x--)server[x].parentNode.removeChild(server[x]);
    }
    firstRender=false;
    if(!keep){
      var html='';
      for(var i=0;i<visible.length;i++)html+=cardHTML(visible[i]);
      container.innerHTML=html;
    }
    document.documentElement.classList.add('bs-srp-ready');
    var cards=container.querySelectorAll('.w-dyn-item');
    // First visible card image is the LCP candidate; eager-load + boost priority.
    // Re-applied every render since filter/sort changes which card is first.
    for(var j=0;j<cards.length;j++){var img=cards[j].querySelector('.listing-image');if(img){if(j===0){img.loading='eager';img.setAttribute('fetchpriority','high');}else{img.loading='lazy';img.removeAttribute('fetchpriority');}}}
    makeCardsClickable(cards);
    if(window.BestestDistance&&typeof window.BestestDistance.refresh==='function')window.BestestDistance.refresh();
    updateCount();updatePills();renderPag(mobile);
    try{document.dispatchEvent(new CustomEvent('bestest:render'));}catch(e){}   // bsx-band re-syncs its model chips
    injectItemListSchema(visible);
  }
  // ItemList JSON-LD for the rendered page of results. The SRP is client-rendered,
  // so schema injected here is exactly what Google's renderer indexes; refreshed on
  // every render so it tracks the visible filter/sort/page state.
  function injectItemListSchema(visible){
    try{
      var items=[];
      for(var i=0;i<visible.length;i++){
        items.push({'@type':'ListItem','position':i+1,'name':visible[i].title,'url':location.origin+visible[i].href});
      }
      var el=document.getElementById('bs-itemlist-schema');
      if(!el){el=document.createElement('script');el.type='application/ld+json';el.id='bs-itemlist-schema';document.head.appendChild(el);}
      el.textContent=JSON.stringify({'@context':'https://schema.org','@type':'ItemList','numberOfItems':items.length,'itemListElement':items});
    }catch(e){}
  }
  function makeCardsClickable(items){Array.prototype.forEach.call(items,function(item){if(item.dataset.bsClickable)return;var link=item.querySelector('a');var href=link&&link.getAttribute('href');if(!href)return;item.dataset.bsClickable='1';item.style.cursor='pointer';item.addEventListener('click',function(e){if(e.target.closest('a, button'))return;e.preventDefault();e.stopPropagation();window.location.href=href;},true);});}
  function renderPag(mobile){
    var old=document.getElementById('bs-pag');if(old)old.remove();
    var oldMore=document.getElementById('bs-more');if(oldMore)oldMore.remove();
    var anchor=getInventoryList();if(!anchor)return;
    if(mobile){
      if(state.shown<filtered.length){
        var btn=document.createElement('button');btn.id='bs-more';btn.className='bs-more';
        var remaining=filtered.length-state.shown;
        btn.textContent='Show '+Math.min(remaining,MOBILE_PER_PAGE)+' more';
        btn.onclick=function(){state.shown+=MOBILE_PER_PAGE;render();};
        anchor.after(btn);
      }
      return;
    }
    var total=Math.ceil(filtered.length/PER_PAGE);
    if(total<=1)return;
    var pag=document.createElement('div');pag.id='bs-pag';pag.className='bs-pag';
    function pb(label,page,disabled,active,ellipsis){
      var b=document.createElement('button');
      b.className='bs-pbtn'+(active?' bs-cur':'')+(ellipsis?' bs-ellipsis':'');
      b.innerHTML=label;b.disabled=!!disabled;
      if(!disabled&&!ellipsis)b.onclick=function(){state.page=page;render();scrollUp();};
      return b;
    }
    pag.appendChild(pb('&#8592; Prev',state.page-1,state.page===1));
    var s=Math.max(1,state.page-2), e=Math.min(total,s+4);
    if(e-s<4)s=Math.max(1,e-4);
    if(s>1){pag.appendChild(pb('1',1,false,state.page===1));if(s>2)pag.appendChild(pb('...',0,true,false,true));}
    for(var i=s;i<=e;i++)pag.appendChild(pb(i,i,false,i===state.page));
    if(e<total){if(e<total-1)pag.appendChild(pb('...',0,true,false,true));pag.appendChild(pb(total,total,false,state.page===total));}
    pag.appendChild(pb('Next &#8594;',state.page+1,state.page===total));
    anchor.after(pag);
  }
  function scrollUp(){var bar=document.getElementById('bs-bar');if(bar){var top=bar.getBoundingClientRect().top+window.pageYOffset;window.scrollTo(0,top);}}
  function fmt(n){return n.toLocaleString('en-US');}
  function updateCount(){
    var el=document.getElementById('bs-count');if(!el)return;
    if(!loadComplete){el.classList.remove('bs-ready');el.textContent='';}
    else {el.textContent=fmt(filtered.length)+' Bestest listings';el.classList.add('bs-ready');}
    var ca=document.getElementById('bs-clearall');
    if(ca){var active=isQueryActive();active?ca.classList.add('bs-vis'):ca.classList.remove('bs-vis');}
  }
  // Chips (scope + shopper picks). Segment SRPs filter models in the band, so no make/model chips there.
  function renderChips(){
    var box=document.getElementById('bs-chips');if(!box)return;
    var html='';
    chipKeys().forEach(function(k){var f=getFilterByKey(k);if(!f||IS_SRP&&(k==='segment'||k==='make'||k==='model'||k==='body_style'))return;(state[k]||[]).forEach(function(v){html+='<button type="button" class="bs-chip" data-f="'+escAttr(k)+'" data-v="'+escAttr(v)+'" aria-label="Remove '+escAttr(optLabel(f,v))+'">'+escHtml(optLabel(f,v))+' <span class="bs-chip-x" aria-hidden="true">✕</span></button>';});});
    box.innerHTML=html;
  }
  function removeChip(k,v){
    if(isScoped()&&inScope(k,v)){var rest=state[k].filter(function(x){return x!==v;});state[k]=rest;if(k==='make')state.model=state.model.filter(function(m){var parents=MAKES_BY_MODEL[m]||[];return parents.some(function(mk){return state.make.indexOf(mk)!==-1;});});leaveForParent();return;}
    state[k]=state[k].filter(function(x){return x!==v;});
    if(k==='make'&&state.model.length){state.model=state.model.filter(function(m){var parents=MAKES_BY_MODEL[m]||[];if(!state.make.length)return false;return parents.some(function(mk){return state.make.indexOf(mk)!==-1;});});}
    document.querySelectorAll('#bsd-'+k+' input').forEach(function(cb){cb.checked=state[k].indexOf(cb.value)!==-1;});
    applyFilters();
  }
  function updatePills(){
    renderChips();
    var ck=chipKeys();
    FILTERS.forEach(function(f){
      var pill=document.getElementById('bsp-'+f.key);if(!pill)return;
      var n=state[f.key].length;
      var pw=pill.closest('.bs-pw');if(pw)pw.classList.toggle('bs-hidden',ck.indexOf(f.key)!==-1&&n>0);   // its chip is up: no 'Make · Toyota' duplicate
      pill.classList.toggle('bs-active',n>0);
      var tn=pill.firstChild;
      if(tn&&tn.nodeType===3)tn.textContent=(n===0||f.opts.length===1)?f.label+' ':n===1?f.label+' · '+optLabel(f,state[f.key][0])+' ':f.label+' · '+n+' ';
    });
    var sortPill=document.getElementById('bsp-sort');
    if(sortPill){
      sortPill.classList.toggle('bs-active',!!sortKey);
      var tn=sortPill.firstChild;
      if(tn&&tn.nodeType===3){var found=null;for(var i=0;i<SORTS.length;i++){if(SORTS[i].v===sortKey){found=SORTS[i];break;}}tn.textContent=found?'Sort · '+found.short+' ':'Sort ';}
    }
  }
  function positionDrop(drop,pill){var rect=pill.getBoundingClientRect();drop.style.top=rect.bottom+6+'px';drop.style.left=rect.left+'px';}
  function setup(){
    document.addEventListener('mousedown',function(e){
      if(e.isTrusted===false)return;
      var pill=e.target.closest('.bs-pill'), sortOpt=e.target.closest('.bs-sort-opt'), apply=e.target.closest('.bs-apply'), reset=e.target.closest('.bs-reset'), clearall=e.target.closest('#bs-clearall'), chip=e.target.closest('.bs-chip'), inBar=e.target.closest('.bs-bar');
      if(chip){e.stopImmediatePropagation();e.preventDefault();bsLock=false;closeAll(true);removeChip(chip.dataset.f,chip.dataset.v);return;}
      if(pill){
        e.stopImmediatePropagation();
        var f=pill.dataset.f;
        var drop=document.getElementById('bsd-'+f);
        var wasOpen=drop.classList.contains('bs-open');
        closeAll(true);
        if(!wasOpen){
          if(f==='make')buildMakeDropdownContent();
          if(f==='model')buildModelDropdownContent();
          if(f!=='sort')updateDropdownAvailability(f);
          positionDrop(drop,pill);drop.classList.add('bs-open');bsLock=true;
          setTimeout(function(){bsLock=false;},300);
        }
        return;
      }
      if(sortOpt){
        e.stopImmediatePropagation();bsLock=false;sortKey=sortOpt.dataset.sort;
        document.querySelectorAll('.bs-sort-opt').forEach(function(el){el.classList.toggle('bs-sel',el.dataset.sort===sortKey);});
        closeAll(true);applyFilters();return;
      }
      if(apply){
        e.stopImmediatePropagation();bsLock=false;
        var f=apply.dataset.f;
        var checked=Array.from(document.querySelectorAll('#bsd-'+f+' input:checked')).map(function(cb){return cb.value;});
        if(f==='segment'){var target=resolveSegmentNavigation(checked);if(target===null){closeAll(true);return;}window.location.href=target;return;}
        state[f]=checked;
        if(f==='make'&&state.model.length){state.model=state.model.filter(function(m){var parents=MAKES_BY_MODEL[m]||[];if(!state.make.length)return false;return parents.some(function(mk){return state.make.indexOf(mk)!==-1;});});}
        if(f==='model'&&state.model.length){state.model.forEach(function(m){var parents=MAKES_BY_MODEL[m]||[];parents.forEach(function(mk){if(state.make.indexOf(mk)===-1)state.make.push(mk);});});}
        closeAll(true);applyFilters();return;
      }
      if(reset){
        e.stopImmediatePropagation();bsLock=false;
        var f=reset.dataset.f;
        if(f==='sort'){sortKey='';document.querySelectorAll('.bs-sort-opt').forEach(function(el){el.classList.remove('bs-sel');});closeAll(true);applyFilters();}
        else if(f==='segment'){document.querySelectorAll('#bsd-segment input').forEach(function(cb){cb.checked=false;});}
        else {document.querySelectorAll('#bsd-'+f+' input').forEach(function(cb){cb.checked=false;});state[f]=[];closeAll(true);applyFilters();}
        return;
      }
      if(clearall){
        e.stopImmediatePropagation();bsLock=false;
        if(isScoped()){window.location.href=parentPath();return;}   // scoped landing page: up to the parent, clean
        FILTERS.forEach(function(f){if(IS_SRP&&f.key==='segment')return;state[f.key]=[];document.querySelectorAll('#bsd-'+f.key+' input').forEach(function(cb){cb.checked=false;});});
        closeAll(true);applyFilters();return;   // sort is left alone: it is a sort, not a filter
      }
      if(inBar)return;
      closeAll();
    },true);
    window.addEventListener('popstate',function(){readURLParams();syncCheckboxesToState();refilterPreservingState();state.page=1;state.shown=MOBILE_PER_PAGE;render();});
    window.addEventListener('scroll',function(){var openDrop=document.querySelector('.bs-drop.bs-open');if(!openDrop)return;var f=openDrop.id.replace('bsd-','');var pill=document.getElementById('bsp-'+f);if(pill)positionDrop(openDrop,pill);},true);
    window.addEventListener('resize',function(){closeAll(true);render();});
  }
  function closeAll(force){if(!force&&bsLock)return;document.querySelectorAll('.bs-drop').forEach(function(d){d.classList.remove('bs-open');});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject); else setTimeout(inject,300);
  window.Bestest={state:state,applyFilters:applyFilters,getAllItems:function(){return allItems;},getData:getData,isReady:function(){return feedReady;},onReady:function(cb){if(feedReady)cb(); else {var iv=setInterval(function(){if(feedReady){clearInterval(iv);cb();}},100);}}};
  // distance.js calls this once the visitor's zip lat/lng resolves; re-sort if nearest-first
  // is active off the user's location (city pages use BS_CITY and don't need this).
  window.__bsOnUserLatLng=function(){if(sortKey==='distance-asc'&&!(window.BS_CITY&&typeof window.BS_CITY.lat==='number')){refilterPreservingState();render();}};
})();
