(function(){
var Q=new URLSearchParams(location.search);
var API=Q.get("api")||"https://api.github.com";
var OWNER="malakfarag-eg",REPO="felklam-klam",BR="main";
var app=document.getElementById("app"),TOK=localStorage.getItem("adm_tok")||"";
var DATA=null,SHA=null,view="eps",edit=null,msg=null;
function h(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function b64e(u8){var s="",i;for(i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function txt2b64(t){return b64e(new TextEncoder().encode(t))}
function b64txt(b){var s=atob(b.replace(/\s/g,"")),u=new Uint8Array(s.length),i;for(i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new TextDecoder().decode(u)}
function gh(path,opt){opt=opt||{};opt.headers=Object.assign({"Accept":"application/vnd.github+json","Authorization":"Bearer "+TOK},opt.headers||{});return fetch(API+path,opt).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok){var e=new Error(j.message||("خطأ "+r.status));e.status=r.status;throw e}return j})})}
function cpath(p){return "/repos/"+OWNER+"/"+REPO+"/contents/"+p}
function load(){return gh(cpath("data/episodes.json")+"?ref="+BR+"&t="+Date.now()).then(function(j){DATA=JSON.parse(b64txt(j.content));SHA=j.sha})}
function save(note){return gh(cpath("data/episodes.json"),{method:"PUT",body:JSON.stringify({message:note,content:txt2b64(JSON.stringify(DATA,null,2)),sha:SHA,branch:BR})}).then(function(j){SHA=j.content.sha})}
function putFile(path,b64,note){return gh(cpath(path)+"?ref="+BR).then(function(j){return j.sha},function(e){if(e.status==404)return null;throw e}).then(function(sha){var b={message:note,content:b64,branch:BR};if(sha)b.sha=sha;return gh(cpath(path),{method:"PUT",body:JSON.stringify(b)})})}
function fileB64(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result.split(",")[1])};r.onerror=rej;r.readAsDataURL(f)})}
function audioDur(f){return new Promise(function(res){var a=new Audio(),u=URL.createObjectURL(f);a.preload="metadata";a.onloadedmetadata=function(){var s=Math.round(a.duration),m=Math.floor(s/60);URL.revokeObjectURL(u);res(m+":"+("0"+(s%60)).slice(-2))};a.onerror=function(){res(null)};a.src=u})}
function ytid(v){v=(v||"").trim();var m=v.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);if(m)return m[1];return /^[\w-]{11}$/.test(v)?v:""}
function M(){return '<div id="mb">'+(msg?'<div class="msg '+msg[0]+'">'+h(msg[1])+'</div>':"")+'</div>'}
function setMsg(t,k,keep){msg=[k||"",t];var mb=document.getElementById("mb");if(keep&&mb)mb.innerHTML='<div class="msg '+(k||"")+'">'+h(t)+'</div>';else render()}
function render(){
  if(!TOK)return renderLogin();
  if(!DATA)return app.innerHTML='<p class="muted">جاري التحميل...</p>'+M();
  var t='<div class="tabs"><button data-v="eps" class="'+(view=="eps"||view=="form"?"on":"")+'">الحلقات</button><button data-v="items" class="'+(view=="items"?"on":"")+'">اسأل نفسك</button><button data-v="out">خروج</button></div>'+M();
  if(view=="eps")t+=epsView();else if(view=="form")t+=formView();else if(view=="items")t+=itemsView();
  app.innerHTML=t;bind()
}
function renderLogin(){
  app.innerHTML='<h1>أهلًا ملك</h1><p>الصقي المفتاح (Token) من GitHub هنا مرة واحدة. بيتحفظ على موبايلك بس.</p>'+M()+'<label>المفتاح<input id="tok" type="password" autocomplete="off" dir="ltr"></label><p><button class="btn pri" id="go">دخول</button></p>';
  document.getElementById("go").onclick=function(){var v=document.getElementById("tok").value.trim();if(!v)return;TOK=v;msg=null;gh("/repos/"+OWNER+"/"+REPO).then(function(r){if(r.permissions&&!r.permissions.push)throw new Error("المفتاح ده مش بيدي صلاحية الكتابة");localStorage.setItem("adm_tok",TOK);return load()}).then(function(){render()}).catch(function(e){TOK="";setMsg(e.status==401?"المفتاح غلط أو منتهي":e.message,"err")})}
}
function epsView(){
  var l=DATA.episodes.slice().sort(function(a,b){return b.n-a.n}),o='<div class="top"><h1>الحلقات</h1><button class="btn pri sm" data-new="1">+ حلقة جديدة</button></div>';
  l.forEach(function(e){var d=e.status=="draft";o+='<div class="card"><div class="n">'+e.n+'</div><div class="t"><b>'+h(e.title)+'</b><small>'+h(e.date)+' · '+h(e.duration)+'</small> <span class="pill '+(d?"d":"")+'">'+(d?"مسودة":"منشورة")+'</span></div><div class="acts"><button class="btn sm" data-edit="'+e.n+'">تعديل</button><button class="btn sm" data-tog="'+e.n+'">'+(d?"نشر":"إخفاء")+'</button></div></div>'});
  return o
}
function opt(v,t,s){return '<option value="'+v+'"'+(s?" selected":"")+'>'+h(t)+'</option>'}
function formView(){
  var e=edit,isNew=!e.old;
  var top=DATA.topics.map(function(t,i){return opt(i,t,e.topic==i)}).join("");
  return '<h1>'+(isNew?"حلقة جديدة":"تعديل الحلقة "+e.n)+'</h1>'+
  '<label>رقم الحلقة<input id="f_n" value="'+e.n+'" readonly></label>'+
  '<label>اسم الحلقة<input id="f_title" value="'+h(e.title)+'"></label>'+
  '<label>الكلمة الكبيرة<small>كلمة واحدة بتظهر في خلفية صفحة الحلقة</small><input id="f_word" value="'+h(e.word)+'"></label>'+
  '<label>الموضوع<select id="f_topic">'+top+'</select></label>'+
  '<label>الجملة اللي بتشد<small>سطر واحد بيظهر تحت الاسم</small><input id="f_hook" value="'+h(e.hook)+'"></label>'+
  '<label>الاقتباس<small>الجملة اللي بتظهر في الصندوق الأسود</small><input id="f_quote" value="'+h(e.quote)+'"></label>'+
  '<label>وصف الحلقة<small>كل فقرة بينها سطر فاضي</small><textarea id="f_desc">'+h((e.desc||[]).join("\n\n"))+'</textarea></label>'+
  '<label>رابط الحلقة على يوتيوب<input id="f_vid" dir="ltr" value="'+(e.vid?"https://youtu.be/"+h(e.vid):"")+'"></label>'+
  '<label>تاريخ النشر<input id="f_date" type="date" value="'+h(e.date)+'"></label>'+
  '<label>ملف الصوت (mp3)'+(e.audio?'<small>فيه صوت متسجل. اختاري ملف جديد بس لو عايزة تغيريه.</small>':'')+'<input id="f_audio" type="file" accept="audio/*"></label>'+
  '<label>نص الحلقة<small>كل فقرة بينها سطر فاضي. ممكن تسيبيه فاضي.</small><textarea id="f_tr" style="min-height:200px">'+h((e.transcript||[]).join("\n\n"))+'</textarea></label>'+
  '<label>الحالة<select id="f_status">'+opt("published","منشورة",e.status!="draft")+opt("draft","مسودة (مش بتظهر للناس)",e.status=="draft")+'</select></label>'+M()+
  '<p><button class="btn pri" id="sv">حفظ</button> <button class="btn" id="cn">رجوع</button></p>'
}
function itemsView(){
  var o='<h1>اسأل نفسك</h1>',pub=DATA.episodes.filter(function(e){return e.status!="draft"});
  DATA.space_items.forEach(function(it,i){o+='<div class="card"><div class="t"><small>'+h(it.kind)+' · من حلقة '+it.episode+'</small><b>'+h(it.text)+'</b></div><div class="acts"><button class="btn sm" data-del="'+i+'">مسح</button></div></div>'});
  o+='<h2>إضافة</h2><label>النوع<select id="i_kind">'+opt("سؤال","سؤال")+opt("اقتباس","اقتباس")+'</select></label><label>النص<textarea id="i_text"></textarea></label><label>من أي حلقة<select id="i_ep">'+pub.map(function(e){return opt(e.n,e.n+" - "+e.title)}).join("")+'</select></label><p><button class="btn pri" id="ia">إضافة</button></p>';
  return o
}
function doSave(){
  var g=function(i){return document.getElementById(i).value},e=edit,old=e.old,file=document.getElementById("f_audio").files[0];
  var title=g("f_title").trim(),vid=ytid(g("f_vid"));
  if(!title||!g("f_word").trim()||!g("f_hook").trim()||!g("f_quote").trim()||!g("f_date"))return setMsg("كملي الاسم والكلمة الكبيرة والجملة والاقتباس والتاريخ","err",1);
  if(g("f_vid").trim()&&!vid)return setMsg("رابط يوتيوب مش مفهوم","err",1);
  if(!old&&!file)return setMsg("اختاري ملف الصوت للحلقة الجديدة","err",1);
  var para=function(s){return s.split(/\n\s*\n/).map(function(x){return x.trim()}).filter(Boolean)};
  var desc=para(g("f_desc"));if(!desc.length)return setMsg("اكتبي وصف الحلقة","err",1);
  var btn=document.getElementById("sv");btn.disabled=true;setMsg("جاري الحفظ... متقفليش الصفحة","",1);
  var p=Promise.resolve(null);
  if(file)p=Promise.all([audioDur(file),fileB64(file)]).then(function(r){return putFile("audio/"+e.n+".mp3",r[1],"audio "+e.n).then(function(){return r[0]})});
  p.then(function(dur){
    return load().then(function(){
      var o={n:e.n,vid:vid,title:title,word:g("f_word").trim(),topic:+g("f_topic"),theme:old&&old.theme||"",desc:desc,quote:g("f_quote").trim(),hook:g("f_hook").trim(),date:g("f_date"),duration:dur||(old&&old.duration)||"0:00",audio:"audio/"+e.n+".mp3",transcript:para(g("f_tr")),status:g("f_status")};
      if(old&&old.thumb)o.thumb=old.thumb;else if(!old&&vid)o.thumb="yt";
      if(!o.theme)delete o.theme;
      var i=DATA.episodes.findIndex(function(x){return x.n==e.n});if(i<0)DATA.episodes.push(o);else DATA.episodes[i]=o;
      return save((old?"edit":"add")+" episode "+e.n)
    })
  }).then(function(){edit=null;view="eps";setMsg("اتحفظت. الموقع بيتحدث خلال دقيقة تقريبًا.","ok")}).catch(function(er){var b=document.getElementById("sv");if(b)b.disabled=false;setMsg("حصلت مشكلة: "+er.message,"err",1)})
}
function mutate(fn,note,okmsg){setMsg("جاري الحفظ...","");load().then(function(){fn();return save(note)}).then(function(){setMsg(okmsg||"اتحفظت. الموقع بيتحدث خلال دقيقة تقريبًا.","ok")}).catch(function(er){setMsg("حصلت مشكلة: "+er.message,"err")})}
function bind(){
  app.querySelectorAll("[data-v]").forEach(function(b){b.onclick=function(){var v=b.getAttribute("data-v");if(v=="out"){localStorage.removeItem("adm_tok");TOK="";DATA=null;msg=null;return render()}view=v;msg=null;render()}});
  app.querySelectorAll("[data-new]").forEach(function(b){b.onclick=function(){var n=DATA.episodes.reduce(function(m,x){return Math.max(m,x.n)},0)+1;edit={n:n,title:"",word:"",topic:0,hook:"",quote:"",desc:[],vid:"",date:new Date().toISOString().slice(0,10),transcript:[],status:"draft",old:null};view="form";msg=null;render()}});
  app.querySelectorAll("[data-edit]").forEach(function(b){b.onclick=function(){var o=DATA.episodes.find(function(x){return x.n==b.getAttribute("data-edit")});edit=Object.assign({},o,{old:o});view="form";msg=null;render()}});
  app.querySelectorAll("[data-tog]").forEach(function(b){b.onclick=function(){var n=+b.getAttribute("data-tog");mutate(function(){var e=DATA.episodes.find(function(x){return x.n==n});e.status=e.status=="draft"?"published":"draft"},"toggle episode "+n)}});
  app.querySelectorAll("[data-del]").forEach(function(b){b.onclick=function(){if(!confirm("تمسحي العنصر ده؟"))return;var i=+b.getAttribute("data-del");mutate(function(){DATA.space_items.splice(i,1)},"remove item")}});
  var sv=document.getElementById("sv");if(sv)sv.onclick=doSave;
  var cn=document.getElementById("cn");if(cn)cn.onclick=function(){edit=null;view="eps";msg=null;render()};
  var ia=document.getElementById("ia");if(ia)ia.onclick=function(){var t=document.getElementById("i_text").value.trim();if(!t)return;var k=document.getElementById("i_kind").value,ep=+document.getElementById("i_ep").value;mutate(function(){DATA.space_items.push({kind:k,text:t,episode:ep})},"add item")}
}
if(TOK)load().then(render).catch(function(e){if(e.status==401){TOK="";localStorage.removeItem("adm_tok")}msg=["err",e.status==401?"المفتاح غلط أو منتهي":e.message];render()});else render();
})();
