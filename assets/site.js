/* SLAYER — shared nav + footer. Single source of truth, injected on every page.
   Edit here → every page updates. Visual chrome can never drift out of sync. */
(function(){
  var P = location.pathname.replace(/\/+$/,"") || "/";
  var LINKS = [
    ["/propozycja","propozycja v3"],
    ["/kierunki","kierunki"],
    ["/trening","trening"],
    ["/styl","styl"],
    ["/eksperymenty","log"],
    ["/rules","rules"],
    ["/zadania","zadania"],
    ["/datasety","datasety"],
    ["/wiedza","wiedza"],
    ["/leaderboard","leaderboard"],
    ["/progress","na żywo"],
    ["/team","zespół"]
  ];
  var nav = '<header class="nav">'
    + '<a class="brand" href="/"><span class="mk">S</span>slayer<span class="sl">·</span>protocol</a>'
    + '<nav class="nlinks">'
    + LINKS.map(function(l){
        var active = (P===l[0]) ? " active" : "";
        return '<a class="'+active.trim()+'" href="'+l[0]+'">'+l[1]+'</a>';
      }).join("")
    + '<a class="ncta" href="https://discord.gg/HnTkVR4c5T" rel="noopener" target="_blank">wejście →</a>'
    + '</nav></header>';

  var foot = '<footer class="foot">'
    + '<span>SLAYER — applied research lab · Polish LLMs · 2026</span>'
    + '<span><a href="https://github.com/slayerlabs" rel="noopener">GitHub</a> · <a href="/benchmarks">protokoły</a> · <a href="/leaderboard">pomiary</a> · <a href="/rules">rules</a> · <a href="/roadmap">roadmap</a> · <a href="/team">zespół</a> · <a href="/zespol">wejście</a></span>'
    + '</footer>';

  function inject(){
    var n=document.getElementById("site-nav"); if(n) n.outerHTML=nav;
    var f=document.getElementById("site-foot"); if(f) f.outerHTML=foot;
  }

  // Vercel Web Analytics + Speed Insights (static-site: inject the scripts, no npm build needed).
  function analytics(){
    var h=location.hostname;
    if(h==="localhost"||h==="127.0.0.1") return;            // skip local dev
    window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
    ["/_vercel/insights/script.js","/_vercel/speed-insights/script.js"].forEach(function(src){
      var s=document.createElement("script"); s.defer=true; s.src=src; document.head.appendChild(s);
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){inject();analytics();});
  else { inject(); analytics(); }
})();
