(function(){
"use strict";
var A=new Audio(); A.preload="none";
var cur=null; // {n,src,title,url}
var mini=document.createElement("div"); mini.id="mini";
mini.innerHTML='<div class="mb"><i></i></div><div class="mi"><button class="pp" aria-label="شغّل / وقّف"></button><a href="#"></a><small>0:00</small><button class="x" aria-label="اقفل المشغل">×</button></div>';
document.body.appendChild(mini);
var mA=mini.querySelector("a"), mT=mini.querySelector("small"), mI=mini.querySelector(".mb i");
function fmt(t){if(!isFinite(t))t=0;t=Math.floor(t);var m=Math.floor(t/60),s=t%60;return m+":"+(s<10?"0":"")+s}
function abs(u,base){try{return new URL(u,base||document.baseURI).href}catch(e){return u}}
function sync(){
  var playing=!A.paused&&cur;
  mini.classList.toggle("playing",!!playing);
  document.querySelectorAll("[data-play]").forEach(function(b){b.classList.toggle("playing",!!(playing&&cur&&b.dataset.play==cur.n))});
  document.querySelectorAll(".ply").forEach(function(p){
    var mine=cur&&p.dataset.n==cur.n;
    p.classList.toggle("playing",!!(mine&&playing));
    var d=mine&&isFinite(A.duration)?A.duration:0, t=mine?A.currentTime:0;
    var pc=d?t/d*100:0;
    p.querySelector(".bar i").style.width=pc+"%"; p.querySelector(".bar").style.setProperty("--p",pc+"%");
    p.querySelector(".cur").textContent=fmt(t);
    if(d)p.querySelector(".tot").textContent=fmt(d);
    var sp=p.querySelector(".spd"); sp.textContent=A.playbackRate+"×";
  });
  if(cur){var d2=isFinite(A.duration)?A.duration:0;mI.style.width=(d2?A.currentTime/d2*100:0)+"%";mT.textContent=fmt(A.currentTime)+(d2?" / "+fmt(d2):"")}
}
["timeupdate","play","pause","loadedmetadata","ratechange","ended"].forEach(function(ev){A.addEventListener(ev,sync)});
function load(o){
  if(cur&&cur.n==o.n)return;
  cur=o; A.src=o.src; A.playbackRate=A.playbackRate||1;
  mA.textContent=o.title; mA.href=o.url; mini.classList.add("on"); document.body.classList.add("hasmini");
}
function toggle(o){
  if(cur&&cur.n==o.n){ if(A.paused)A.play().catch(function(){}); else A.pause(); }
  else{ load(o); A.play().catch(function(){}); }
  sync();
}
function objOf(el){return {n:el.dataset.n||el.dataset.play,src:abs(el.dataset.src),title:el.dataset.title,url:abs(el.dataset.url)}}
mini.querySelector(".pp").onclick=function(){if(cur)toggle(cur)};
mini.querySelector(".x").onclick=function(){A.pause();A.removeAttribute("src");A.load();cur=null;mini.classList.remove("on");document.body.classList.remove("hasmini");sync()};
mA.addEventListener("click",function(e){e.preventDefault();go(mA.href)});
// seek helpers
function seekFrom(bar,e){
  var r=bar.getBoundingClientRect(),x=(r.right-e.clientX)/r.width; x=Math.max(0,Math.min(1,x));
  var p=bar.closest(".ply"); if(!cur||cur.n!=p.dataset.n)load(objOf(p));
  var go_=function(){A.currentTime=x*A.duration;sync()};
  if(isFinite(A.duration))go_(); else A.addEventListener("loadedmetadata",go_,{once:true});
  if(A.preload!=="auto")A.load&&0;
}
var dragging=null;
document.addEventListener("pointerdown",function(e){var b=e.target.closest&&e.target.closest(".ply .bar");if(b){dragging=b;if(A.readyState===0&&cur&&A.src){A.preload="metadata"}seekFrom(b,e)}});
document.addEventListener("pointermove",function(e){if(dragging)seekFrom(dragging,e)});
document.addEventListener("pointerup",function(){dragging=null});
document.addEventListener("keydown",function(e){var b=e.target.closest&&e.target.closest(".ply .bar");if(!b)return;
  if(e.key==="ArrowLeft"){A.currentTime+=5;e.preventDefault()}if(e.key==="ArrowRight"){A.currentTime-=5;e.preventDefault()}});
document.addEventListener("input",function(e){if(e.target.matches(".ply .vol input"))A.volume=+e.target.value});
document.addEventListener("click",function(e){
  var t=e.target;
  var pl=t.closest("[data-play]"); if(pl){e.preventDefault();toggle(objOf(pl));return}
  var pp=t.closest(".ply .pp"); if(pp){toggle(objOf(pp.closest(".ply")));return}
  var sk=t.closest(".ply .sk"); if(sk){var p=sk.closest(".ply");if(!cur||cur.n!=p.dataset.n)load(objOf(p));A.currentTime=Math.max(0,A.currentTime+(+sk.dataset.s));sync();return}
  var sp=t.closest(".ply .spd"); if(sp){var r=[1,1.25,1.5,2,.75],i=r.indexOf(A.playbackRate);A.playbackRate=r[(i+1)%r.length];sync();return}
  var sh=t.closest(".ply .sh"); if(sh){var u=location.href,tt=sh.closest(".ply").dataset.title;
    if(navigator.share){navigator.share({title:tt+" | ف الكلامِ كلام",url:u}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){var o=sh.textContent;sh.textContent="اتنسخ";setTimeout(function(){sh.textContent=o},1500)})}
    return}
  var tab=t.closest(".tabs button"); if(tab){showTab(tab.dataset.v);history.replaceState(null,"","#"+tab.dataset.v);return}
  var a=t.closest("a"); if(a&&a.href&&!a.target&&!a.hasAttribute("download")&&a.origin===location.origin&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&e.button===0){
    var u2=new URL(a.href); if(/\.html$|\/$/.test(u2.pathname)){ if(u2.pathname===location.pathname&&u2.hash){return} e.preventDefault(); go(a.href); }
  }
});
// page swap navigation (audio keeps playing)
function fix(root,base){
  root.querySelectorAll("[href],[src],[data-src],[data-url]").forEach(function(el){
    ["href","src","data-src","data-url"].forEach(function(k){var v=el.getAttribute(k);if(v&&!/^(#|https?:|mailto:|tel:|data:)/.test(v))el.setAttribute(k,abs(v,base))})});
}
function swap(doc,url){
  fix(doc.body,url);
  ["header.top","main","footer"].forEach(function(sel){var n=doc.querySelector(sel),o=document.querySelector(sel);if(n&&o)o.innerHTML=n.innerHTML});
  document.body.className=doc.body.className+(cur?" hasmini":""); document.title=doc.title; init();
}
function go(url,pop){
  fetch(url).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){
    var doc=new DOMParser().parseFromString(t,"text/html");
    if(!pop)history.pushState(null,"",url);
    swap(doc,new URL(url,location.href).href);
    var h=new URL(url,location.href).hash; if(h&&document.querySelector(h))document.querySelector(h).scrollIntoView(); else window.scrollTo(0,0);
  }).catch(function(){location.href=url});
}
window.addEventListener("popstate",function(){go(location.href,true)});
// per-page init
var io=null;
function showTab(v){
  document.querySelectorAll(".tabs button").forEach(function(b){b.classList.toggle("on",b.dataset.v===v)});
  document.querySelectorAll(".view").forEach(function(s){s.classList.toggle("on",s.dataset.v===v)});
  filter();
}
function filter(){
  var q=document.getElementById("q"); if(!q)return; var s=q.value.trim().toLowerCase();
  var any=false;
  document.querySelectorAll(".view.on .row").forEach(function(r){var ok=!s||r.dataset.s.toLowerCase().indexOf(s)>-1;r.style.display=ok?"":"none";if(ok)any=true});
  document.querySelectorAll(".view.on .tt").forEach(function(h){var nx=h.nextElementSibling;var vis=nx&&Array.prototype.some.call(nx.children,function(c){return c.style.display!=="none"});h.style.display=vis?"":"none";if(nx)nx.style.display=vis?"":"none"});
  var n=document.querySelector(".none"); if(n)n.hidden=any||!s;
}
function init(){
  sync();
  if(io)io.disconnect();
  var rv=document.querySelectorAll(".rv");
  if("IntersectionObserver" in window){io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}})},{threshold:.12});rv.forEach(function(el){io.observe(el)})}
  else rv.forEach(function(el){el.classList.add("in")});
  var q=document.getElementById("q");
  if(q){q.addEventListener("input",filter);var h=location.hash.slice(1);if(h==="all"||h==="topics"||h==="latest")showTab(h);if(h==="q")q.focus()}
  var bg=document.querySelector(".bgw"),eh=document.querySelector(".eh");
  if(bg&&eh&&matchMedia("(pointer:fine)").matches&&!matchMedia("(prefers-reduced-motion:reduce)").matches){
    eh.addEventListener("mousemove",function(e){var r=eh.getBoundingClientRect();bg.style.setProperty("--mx",((e.clientX-r.left)/r.width-.5)*-40+"px");bg.style.setProperty("--my",((e.clientY-r.top)/r.height-.5)*-24+"px")});
  }
}
// forms (web3forms)
document.addEventListener("submit",function(e){
  var f=e.target; if(!f.classList.contains("wf"))return; e.preventDefault();
  var msg=f.querySelector(".msg"),btn=f.querySelector("button[type=submit]"),m=f.message.value.trim();
  if(!m){msg.textContent="اكتب حاجة الأول.";f.message.focus();return}
  btn.disabled=true;msg.textContent="ثانية...";
  var d={access_key:f.access_key.value,subject:f.subject.value,message:m,"النوع":(f.querySelector("input[name=type]:checked")||{}).value||"",name:f.name.value.trim()||"من غير اسم",botcheck:f.botcheck.checked};
  if(f.consent)d["موافقة على النشر"]=f.consent.checked?"أيوه، ممكن تتنشر أو تتستخدم":"لأ";
  fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(d)})
  .then(function(r){return r.json()}).then(function(j){
    if(j.success){msg.textContent="وصلت. شكرًا إنك قولتها.";f.message.value="";f.name.value=""}
    else msg.textContent="حصلت مشكلة وهي ماوصلتش. جرب تاني بعد شوية.";
    btn.disabled=false;
  }).catch(function(){msg.textContent="حصلت مشكلة وهي ماوصلتش. جرب تاني بعد شوية.";btn.disabled=false});
});
init();
})();
