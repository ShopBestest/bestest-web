/* cut-overlay.js — "Which cars make the cut?" modal.
   Self-contained: injects its own styles, binds triggers, renders a dialog.
   Trigger resolution (in priority order):
     1) any element matching [data-bs-cut] or a.bs-cut-link   (explicit, if the
        intro field passes a real link through Webflow rich text)
     2) otherwise, the literal phrase "Which cars make the cut?" found in page
        text is wrapped into an interactive link in place.
   Embed once site-wide, before </body>:
     <script src="https://cdn.jsdelivr.net/gh/ShopBestest/bestest-web@<sha>/js/cut-overlay.js" defer></script>
*/
(function(){
  if(window.__bsCutOverlayInit)return; window.__bsCutOverlayInit=true;

  var ABOUT_URL='/about'; // CONFIRM: destination for "More about Bestest"
  var PHRASE='Which cars make the cut?';
  var GREEN='#1a6f4a';

  // Locked overlay copy — do not reword.
  var BODY="Bestest was founded by the former head of reviews and ratings for Kelley Blue Book, who's spent more than 20 years helping shoppers find the good cars and avoid the bad ones. The only cars you'll find on Bestest are the ones also ranked highly by trusted institutions like Consumer Reports, Kelley Blue Book, Car and Driver, and NHTSA, with extra emphasis on reliability and resale value. In addition, every car on Bestest is offered by a manufacturer-certified franchise dealer, and has no more than five model years or 50,000 miles on the clock. So if it's not on Bestest, just make sure to do a little more homework.";

  function injectStyles(){
    if(document.getElementById('bs-cut-styles'))return;
    var s=document.createElement('style'); s.id='bs-cut-styles';
    s.textContent=
      ".bs-cut-link{color:"+GREEN+";cursor:pointer;text-decoration:none;font-weight:600;white-space:nowrap;background:none;border:none;padding:0;font:inherit;}"+
      ".bs-cut-link:hover{opacity:.75;}"+
      ".bs-cut-arrow{font-size:1.3em;line-height:0;vertical-align:-.06em;margin-left:.14em;display:inline-block;transition:transform .15s ease;}"+
      ".bs-cut-link:hover .bs-cut-arrow{transform:translateX(2px);}"+
      ".bs-cut-ov{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(20,20,20,.55);opacity:0;transition:opacity .18s ease;}"+
      ".bs-cut-ov.bs-open{display:flex;opacity:1;}"+
      ".bs-cut-card{background:#fff;border-radius:16px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;padding:28px 28px 24px;box-shadow:0 12px 40px rgba(0,0,0,.22);transform:translateY(8px);transition:transform .18s ease;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;}"+
      ".bs-cut-ov.bs-open .bs-cut-card{transform:translateY(0);}"+
      ".bs-cut-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}"+
      ".bs-cut-title{font-size:18px;font-weight:700;color:#1a1a1a;margin:0;line-height:1.3;}"+
      ".bs-cut-x{flex-shrink:0;width:30px;height:30px;border:none;background:#f2f2f2;border-radius:50%;font-size:17px;line-height:1;color:#555;cursor:pointer;}"+
      ".bs-cut-x:hover{background:#e6e6e6;}"+
      ".bs-cut-body{font-size:14px;line-height:1.65;color:#333;margin:0 0 18px;}"+
      ".bs-cut-more{display:inline-block;font-size:14px;font-weight:600;color:"+GREEN+";text-decoration:none;}"+
      ".bs-cut-more:hover{text-decoration:underline;}"+
      // interlink block (hub-and-spoke nav, synced as raw HTML per record)
      ".bs-interlink{margin:20px 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:2;}"+
      ".bs-interlink-label{font-weight:600;color:#1a1a1a;margin-right:6px;}"+
      ".bs-interlink a{display:inline-block;color:"+GREEN+";text-decoration:none;border:1px solid #d8e8df;background:#f3f9f5;border-radius:16px;padding:3px 11px;margin:0 4px 6px 0;white-space:nowrap;}"+
      ".bs-interlink a:hover{border-color:"+GREEN+";}";
    (document.head||document.documentElement).appendChild(s);
  }

  var ov=null;
  function buildOverlay(){
    if(ov)return ov;
    ov=document.createElement('div');
    ov.className='bs-cut-ov'; ov.setAttribute('role','dialog');
    ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label',PHRASE);
    ov.innerHTML=
      '<div class="bs-cut-card">'+
        '<div class="bs-cut-head">'+
          '<h2 class="bs-cut-title">'+PHRASE+'</h2>'+
          '<button class="bs-cut-x" type="button" aria-label="Close">×</button>'+
        '</div>'+
        '<p class="bs-cut-body"></p>'+
        '<a class="bs-cut-more" href="'+ABOUT_URL+'">More about Bestest →</a>'+
      '</div>';
    ov.querySelector('.bs-cut-body').textContent=BODY;
    ov.addEventListener('click',function(e){ if(e.target===ov||e.target.classList.contains('bs-cut-x'))close(); });
    document.body.appendChild(ov);
    return ov;
  }
  function open(e){ if(e)e.preventDefault(); buildOverlay(); ov.classList.add('bs-open'); document.addEventListener('keydown',onKey); }
  function close(){ if(ov)ov.classList.remove('bs-open'); document.removeEventListener('keydown',onKey); }
  function onKey(e){ if(e.key==='Escape')close(); }

  function bindEl(el){ if(el.__bsCutBound)return; el.__bsCutBound=true; el.classList.add('bs-cut-link'); el.setAttribute('role','button'); el.setAttribute('tabindex','0'); el.addEventListener('click',open); el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ')open(e); }); }

  // 1) explicit triggers
  function bindExplicit(){
    var nodes=document.querySelectorAll('[data-bs-cut], a.bs-cut-link');
    nodes.forEach(bindEl);
    return nodes.length>0;
  }

  // 2) wrap the literal phrase in any text node that contains it
  function wrapPhrase(){
    var found=false;
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        if(!n.nodeValue||n.nodeValue.indexOf(PHRASE)===-1)return NodeFilter.FILTER_REJECT;
        var p=n.parentNode; if(!p)return NodeFilter.FILTER_REJECT;
        var tag=p.nodeName; if(tag==='SCRIPT'||tag==='STYLE'||tag==='TEXTAREA')return NodeFilter.FILTER_REJECT;
        if(p.closest&&p.closest('.bs-cut-ov'))return NodeFilter.FILTER_REJECT; // skip our own modal
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var targets=[],n;
    while((n=walker.nextNode()))targets.push(n);
    targets.forEach(function(node){
      var idx=node.nodeValue.indexOf(PHRASE); if(idx===-1)return;
      var after=node.splitText(idx);
      after.nodeValue=after.nodeValue.slice(PHRASE.length); // remaining text (e.g. a trailing arrow) stays put
      var link=document.createElement('span');
      link.innerHTML=PHRASE+' <span class="bs-cut-arrow" aria-hidden="true">→</span>';
      bindEl(link);
      node.parentNode.insertBefore(link,after);
      // if the leftover starts with the manual arrow used in the field, drop it to avoid a double arrow
      after.nodeValue=after.nodeValue.replace(/^\s*→\s*/,'');
      found=true;
    });
    return found;
  }

  function init(){
    injectStyles();
    var hasExplicit=bindExplicit();
    if(!hasExplicit)wrapPhrase();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
