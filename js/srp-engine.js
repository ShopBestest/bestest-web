.bs-bar { width:100%; padding:8px 0 4px; font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif; }
.bs-progress { position:fixed; top:0; left:0; right:0; height:3px; background:transparent; z-index:99999; pointer-events:none; opacity:0; transition:opacity .25s ease; overflow:hidden; }
.bs-progress.bs-show { opacity:1; }
.bs-progress-fill { height:100%; width:0%; background:#31b56b; transition:width .35s cubic-bezier(.25,.46,.45,.94); box-shadow:0 0 8px rgba(49,181,107,.5); }
.bs-progress.bs-indeterminate .bs-progress-fill { width:30%; animation:bs-progress-slide 1.4s ease-in-out infinite; transition:none; }
@keyframes bs-progress-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(400%); } }
.bs-pills { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; }
.bs-pills::-webkit-scrollbar { display:none; }
.bs-pw { position:relative; flex-shrink:0; }
.bs-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border:1px solid #d0d0d0; border-radius:20px; font-size:11px; color:#1a1a1a; background:#fff; white-space:nowrap; cursor:pointer; user-select:none; transition:border-color .15s,background .15s; }
.bs-pill:hover { border-color:#999; }
.bs-pill.bs-active { background:#1a1a1a; color:#fff; border-color:#1a1a1a; }
.bs-meta { display:flex; align-items:center; justify-content:space-between; margin-top:6px; height:16px; }
.bs-count { font-size:11px; color:#888; opacity:0; transition:opacity .2s ease; }
.bs-count.bs-ready { opacity:1; }
.bs-clearall { font-size:10px; color:#bbb; cursor:pointer; background:none; border:none; padding:0; display:none; text-decoration:underline; text-underline-offset:2px; }
.bs-clearall:hover { color:#888; }
.bs-clearall.bs-vis { display:block; }
.bs-drop { position:fixed; background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:16px; min-width:240px; max-width:320px; z-index:9999; box-shadow:0 4px 16px rgba(0,0,0,.08); display:none; }
.bs-drop.bs-open { display:block; }
.bs-drop-segment { min-width:300px; max-width:380px; }
.bs-drop-title { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#888; margin:0 0 10px; }
.bs-opts { display:grid; grid-auto-flow:column; grid-template-columns:1fr 1fr; grid-template-rows:repeat(12,auto); gap:4px 12px; max-height:260px; overflow-y:auto; overflow-x:hidden; }
@media (max-width:600px){ .bs-opts { grid-template-columns:1fr; grid-template-rows:none; grid-auto-flow:row; } }
.bs-opts.bs-1col { column-count:1; }
.bs-opt { display:flex; align-items:flex-start; gap:7px; font-size:13px; color:#1a1a1a; cursor:pointer; padding:3px 0; line-height:1.4; break-inside:avoid; -webkit-column-break-inside:avoid; }
.bs-opt input { width:14px; height:14px; cursor:pointer; flex-shrink:0; margin-top:2px; accent-color:#1a1a1a; }
.bs-opt.bs-disabled { opacity:.35; cursor:not-allowed; pointer-events:none; }
.bs-eg { font-size:11px; color:#aaa; display:block; }
.bs-model-group, .bs-seg-group { font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#888; padding:8px 0 4px; border-bottom:1px solid #f0f0f0; margin-bottom:2px; }
.bs-model-group:first-child, .bs-seg-group:first-child { padding-top:0; }
.bs-empty-msg { font-size:12px; color:#888; padding:8px 4px; line-height:1.5; }
.bs-foot { margin-top:12px; display:flex; gap:8px; }
.bs-apply { flex:1; padding:8px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; }
.bs-reset { padding:8px 12px; background:none; color:#888; border:1px solid #e0e0e0; border-radius:8px; font-size:13px; cursor:pointer; }
.bs-sort-opt { padding:9px 10px; font-size:13px; color:#1a1a1a; cursor:pointer; border-radius:6px; transition:background .1s; display:flex; align-items:center; gap:8px; }
.bs-sort-opt:hover { background:#f5f5f5; }
.bs-sort-opt.bs-sel { font-weight:600; }
.bs-sort-opt.bs-sel::before { content:'\2713  '; }
.bs-pag { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:32px; padding-bottom:16px; flex-wrap:wrap; width:100%; }
.bs-pbtn { min-width:36px; height:36px; padding:0 10px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; color:#1a1a1a; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:border-color .15s; }
.bs-pbtn:hover { border-color:#999; }
.bs-pbtn.bs-cur { background:#1a1a1a; color:#fff; border-color:#1a1a1a; }
.bs-pbtn:disabled { opacity:.35; cursor:default; }
.bs-pbtn.bs-ellipsis { border:none; cursor:default; min-width:20px; }
.bs-pbtn.bs-ellipsis:hover { border:none; }
.bs-more { display:block; width:100%; max-width:320px; padding:12px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:14px; color:#1a1a1a; cursor:pointer; margin:24px auto 0; }
.bs-more:hover { border-color:#999; }
.w-pagination-wrapper { display:none !important; }
.bs-total-count { display:none !important; }
.w-dyn-list { width:100% !important; }
.w-dyn-items { width:100% !important; min-width:0 !important; grid-template-columns:repeat(3,1fr) !important; }
@media (max-width:767px) { .w-dyn-items { grid-template-columns:repeat(2,1fr) !important; } }
@media (max-width:479px) { .w-dyn-items { grid-template-columns:1fr !important; } }
.w-dyn-item { min-width:0 !important; display:flex !important; flex-direction:column !important; }
.w-dyn-item.bs-hidden { display:none !important; }
.car-card { height:100% !important; box-sizing:border-box !important; min-width:0 !important; cursor:pointer !important; }
.car-card .w-button { width:100% !important; box-sizing:border-box !important; white-space:normal !important; }
