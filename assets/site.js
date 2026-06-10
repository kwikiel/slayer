/* SLAYER — shared nav + footer. Single source of truth, injected on every page.
   Edit here → every page updates. Visual chrome can never drift out of sync. */
(function(){
  var P = location.pathname.replace(/\/+$/,"") || "/";
  var LINKS = [
    ["/kierunki","kierunki"],
    ["/trening","trening"],
    ["/eksperymenty","log"],
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
})();
