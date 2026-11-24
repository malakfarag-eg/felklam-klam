(function(){
var d=document,h=d.documentElement,L=h.getAttribute("data-lang")||"ar";
var D={
"الحلقات":"Episodes","اسأل نفسك":"Ask Yourself","عنّا":"About","تواصل":"Contact",
"يوتيوب":"YouTube","إنستجرام":"Instagram","فيسبوك":"Facebook",
"اسمع آخر حلقة":"Listen to the latest episode","ادخل واتفرج براحتك":"Take your time and browse",
"آخر حلقة":"Latest episode","الحلقة":"Episode","شغّل الحلقة":"Play episode","صفحة الحلقة":"Episode page",
"آخر الحلقات":"Latest episodes","كل الحلقات":"All episodes","كل الحلقات ←":"All episodes →",
"عن نفسك":"About you","عن الناس وعنك":"About people and you","عن الوجع والتغيير":"About pain and change",
"كلام برا الحلقات":"Talk outside the episodes","سؤال":"Question","اقتباس":"Quote","كمّل ←":"Keep going →",
"سؤال الفترة دي":"This period's question",
"إيه فكرة مش قادر تبطل تفكر فيها الفترة دي؟":"What's the one thought you can't stop thinking about lately?",
"إجابتي":"My answer","اعتراف":"A confession","سؤال نفسي أسمع عنه حلقة":"A question I want an episode about",
"ابعت":"Send","موافق إن إجابتي تتنشر أو تتستخدم في حلقة لو اتختارت":"I agree my answer can be published or used in an episode if chosen",
"اكتب هنا...":"Write here...","اسمك (لو حابب، ولو مكتبتش هتفضل مجهول)":"Your name (optional, stays anonymous if you skip it)",
"اكتب حاجة الأول.":"Write something first.","ثانية...":"One sec...","وصلت. شكرًا إنك قولتها.":"Got it. Thanks for sharing.",
"حصلت مشكلة وهي ماوصلتش. جرب تاني بعد شوية.":"Something went wrong and it didn't send. Try again in a bit.",
"دوّر باسم الحلقة أو كلمة أو موضوع":"Search by episode name, word or topic","الأحدث":"Newest","المواضيع":"Topics",
"مفيش حلقة بالكلمة دي.":"No episode with that word.",
"شغّل / وقّف":"Play / Pause","شارك":"Share","اتنسخ":"Copied","تحميل":"Download","الصوت":"Volume",
"نص الحلقة":"Transcript","اقرا النص":"Read the text","تسمعها كمان على:":"Also listen on:",
"الحلقة اللي قبلها":"Previous episode","الحلقة اللي بعدها":"Next episode","حلقات قريبة":"More episodes",
"← الحلقات":"← Episodes","اقفل المشغل":"Close player",
"أسئلة":"Questions","اقتباسات":"Quotes","خواطر":"Thoughts","فويس نوتس":"Voice notes","قريبًا.":"Soon.",
"ابعتلنا":"Write to us","اسمك (اختياري)":"Your name (optional)",
"اقتراح موضوع":"Topic suggestion","السوشيال":"Social","تعاون":"Collaboration","رسالة":"Message",
"بحث":"Search","سرعة التشغيل":"Playback speed","مستوى الصوت":"Volume","موضع التشغيل":"Playback position",
"رجوع ١٥ ثانية":"Back 15 seconds","تقديم ١٥ ثانية":"Forward 15 seconds","رسالتك":"Your message","إجابتك":"Your answer"
};
var M={"يناير":"Jan","فبراير":"Feb","مارس":"Mar","أبريل":"Apr","إبريل":"Apr","مايو":"May","يونيو":"Jun","يوليو":"Jul","أغسطس":"Aug","سبتمبر":"Sep","أكتوبر":"Oct","نوفمبر":"Nov","ديسمبر":"Dec"};
function dig(s){return s.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632})}
var TP={"عن نفسك":"About you","عن الناس وعنك":"About people and you","عن الوجع والتغيير":"About pain and change"};
function tr(s){
  var t=s.trim();if(!t)return s;
  var r=null,m;
  if(D[t])r=D[t];
  else if(m=t.match(/^من حلقة (.+) ←$/))r="From the episode "+m[1]+" →";
  else if(m=t.match(/^(.+) · الحلقة ([٠-٩]+)$/))r=(TP[m[1]]||m[1])+" · Episode "+dig(m[2]);
  else if(m=t.match(/^آخر حلقة · (.+)$/))r="Latest episode · "+(TP[m[1]]||m[1]);
  else if(m=t.match(/^([٠-٩]+) حلقات?$/))r=dig(m[1])+" episodes";
  else if(m=t.match(/^شغّل (.+)$/))r="Play "+m[1];
  else if(m=t.match(/^اسمع آخر حلقة (.+)$/))r="Listen to the latest episode "+m[1];
  else if(m=t.match(/^#(عن_[^\s]+)$/)){var k=m[1].replace(/_/g," ");r=TP[k]?"#"+TP[k].replace(/ /g,"_"):null}
  else if(m=t.match(/^([٠-٩]+) (\S+) ([٠-٩]+)( · .+)?$/)){if(M[m[2]])r=dig(m[1])+" "+M[m[2]]+" "+dig(m[3])+(m[4]?dig(m[4]):"")}
  return r==null?s:s.replace(t,r);
}
window.__T=function(s){return L=="en"?tr(s):s};
function run(){
  if(L!="en")return;
  h.lang="en";
  var w=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT,null),n,a=[];
  while(n=w.nextNode())a.push(n);
  a.forEach(function(n){var p=n.parentNode;if(p.closest&&p.closest(".tb,.ab2,script,style"))return;if(p.closest(".rt")&&p.tagName!="EM")return;if(p.closest(".fx")&&p.tagName!="SMALL"&&!p.closest(".cta2")&&!p.classList.contains("fm"))return;var v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v});
  d.querySelectorAll("[aria-label],[placeholder]").forEach(function(e){["aria-label","placeholder"].forEach(function(k){var v=e.getAttribute(k);if(v&&k!="aria-label"||v&&e.getAttribute(k)!="Language"){var t=tr(v);if(t!==v)e.setAttribute(k,t)}})});
  d.querySelectorAll(".num,.an,.tot,.cur").forEach(function(e){if(!e.closest(".rt"))e.textContent=dig(e.textContent)});
  d.querySelectorAll("input[type=text],input:not([type]),textarea").forEach(function(e){e.setAttribute("dir","auto")});
  var t=d.title.split(" | ");if(t.length>1){t[0]=tr(t[0]);d.title=t.join(" | ")}
}
d.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".lsw");if(!b)return;var x=e.target.closest("b");var nl=x?x.getAttribute("data-l"):(L=="ar"?"en":"ar");try{localStorage.setItem("lang",nl)}catch(_){}var u=location.href.replace(/([?&])lang=(ar|en)&?/,"$1").replace(/[?&]$/,"");location.href=u});
if(d.readyState=="loading")d.addEventListener("DOMContentLoaded",run);else run();
})();
