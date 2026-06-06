/* SLAYER — shared nav + footer. Single source of truth, injected on every page.
   Edit here → every page updates. Visual chrome can never drift out of sync. */
(function(){
  var P = location.pathname.replace(/\/+$/,"") || "/";
  var LINKS = [
    ["/kierunki","kierunki"],
    ["/trening","trening"],
    ["/zadania","zadania"],
    ["/datasety","datasety"],
    ["/leaderboard","leaderboard"],
    ["/progress","na żywo"]
  ];
  var nav = '<header class="nav">'
    + '<a class="brand" href="/"><span class="mk">S</span>slayer<span class="sl">·</span>lab</a>'
    + '<nav class="nlinks">'
    + LINKS.map(function(l){
        var active = (P===l[0]) ? " active" : "";
        return '<a class="'+active.trim()+'" href="'+l[0]+'">'+l[1]+'</a>';
      }).join("")
    + '<a class="ncta" href="/zespol">dołącz →</a>'
    + '</nav></header>';

  var foot = '<footer class="foot">'
    + '<span>SLAYER — open polish LLM lab · 2026</span>'
    + '<span><a href="https://github.com/kwikiel/slayer" rel="noopener">GitHub</a> · <a href="/benchmarks">metodologia</a> · <a href="/leaderboard">leaderboard</a> · <a href="/roadmap">roadmap</a> · <a href="/zespol">dołącz</a></span>'
    + '</footer>';

  function inject(){
    var n=document.getElementById("site-nav"); if(n) n.outerHTML=nav;
    var f=document.getElementById("site-foot"); if(f) f.outerHTML=foot;
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",inject); else inject();

  /* ── HUD chrome: narożniki paneli, scanbeam, animacje wejścia.
     Kosmetyka wstrzykiwana centralnie — podstron nie trzeba edytować. ── */
  function hudChrome(){
    document.querySelectorAll(".panel").forEach(function(p){
      if(p.querySelector(".cnr")) return;
      ["tl","tr","bl","br"].forEach(function(pos){
        var c=document.createElement("i");
        c.className="cnr "+pos;
        c.setAttribute("aria-hidden","true");
        p.appendChild(c);
      });
    });
    if(!document.querySelector(".scanbeam")){
      var s=document.createElement("div");
      s.className="scanbeam";
      s.setAttribute("aria-hidden","true");
      document.body.appendChild(s);
    }
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if(!("IntersectionObserver" in window)) return;
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target;
        el.classList.add("in");
        io.unobserve(el);
        /* po wejściu zdejmij opóźnienie kaskady — inaczej opóźniałoby hovery */
        el.addEventListener("transitionend",function done(ev){
          if(ev.propertyName!=="opacity") return; /* czekaj na koniec pełnego fade-in (.55s) */
          el.style.transitionDelay="";
          el.classList.remove("rev","in"); /* element zostaje widoczny; wracają szybkie przejścia hoverów */
          el.removeEventListener("transitionend",done);
        });
      });
    },{threshold:.12});
    var SEL=".hgrid > div:not(.panel) > *, .shead, .panel, .tbl, .tl, .note, .grid > *";
    document.querySelectorAll(SEL).forEach(function(el){
      var idx=Array.prototype.indexOf.call(el.parentElement.children,el);
      el.classList.add("rev");
      el.style.transitionDelay=Math.min(idx*0.08,0.36)+"s";
      io.observe(el);
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",hudChrome); else hudChrome();

  /* ── Arwes FX: canvas „moving lines" w hero.
     Tylko bez prefers-reduced-motion; bez JS strona w pełni statyczna. ── */
  function arwesFx(){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* dryfujące linie świetlne w hero (tylko strona główna ma .hero) */
    var hero=document.querySelector(".hero");
    if(hero && !hero.querySelector(".hero-fx")){
      var cv=document.createElement("canvas");
      cv.className="hero-fx";
      cv.setAttribute("aria-hidden","true");
      hero.insertBefore(cv,hero.firstChild);
      var ctx=cv.getContext("2d");
      var DPR=Math.min(window.devicePixelRatio||1,2),W,H;
      function size(){
        W=hero.clientWidth;H=hero.clientHeight;
        cv.width=W*DPR;cv.height=H*DPR;
        ctx.setTransform(DPR,0,0,DPR,0,0);
      }
      size();window.addEventListener("resize",size);
      function spawn(l){
        l.x=Math.random()*W;
        l.y=H+Math.random()*H*0.5;
        l.len=40+Math.random()*110;
        l.sp=0.5+Math.random()*1.3;
        l.a=0.12+Math.random()*0.18;
        return l;
      }
      var lines=[];
      for(var i=0;i<36;i++){var l=spawn({});l.y=Math.random()*H;lines.push(l)}
      ctx.lineWidth=1.5;
      (function tick(){
        ctx.clearRect(0,0,W,H);
        lines.forEach(function(l){
          l.y-=l.sp;
          if(l.y+l.len<0) spawn(l);
          var g=ctx.createLinearGradient(0,l.y,0,l.y+l.len);
          g.addColorStop(0,"rgba(0,248,255,0)");
          g.addColorStop(.5,"rgba(0,248,255,"+l.a+")");
          g.addColorStop(1,"rgba(0,248,255,0)");
          ctx.strokeStyle=g;
          ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x,l.y+l.len);ctx.stroke();
        });
        requestAnimationFrame(tick);
      })();
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",arwesFx); else arwesFx();
})();
