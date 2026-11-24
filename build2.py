# -*- coding: utf-8 -*-
import os, html, datetime, json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
D=json.load(open("data/episodes.json",encoding="utf-8"))
KEY=D["site"]["form_key"]; YT=D["site"]["youtube"]; TOPICS=D["topics"]
EPS=[]
THEMES=[1,2,3,5,6,7,8]
for x in D["episodes"]:
    if x.get("status")=="draft": continue
    y=dict(x); y["slug"]=str(y["n"]); y["len"]=y["duration"]
    if not y.get("theme"): y["theme"]="t%d"%THEMES[(y["n"]-1)%len(THEMES)]
    EPS.append(y)
EPS.sort(key=lambda z:z["n"])
PUB={z["n"] for z in EPS}
TRANSCRIPTS={x["n"]:x["transcript"] for x in EPS if x.get("transcript")}
SNIPS=[(i["kind"],i["text"],i["episode"]) for i in D["space_items"] if i["episode"] in PUB]
e=html.escape
SPACE_NAME=D["site"]["space_name"]
DATES={x["n"]:x["date"] for x in EPS}
MON=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
AR=str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩")
def ar(x): return str(x).translate(AR)
def dfmt(n):
    d=datetime.date.fromisoformat(DATES[n]); return ar(f"{d.day} {MON[d.month-1]} {d.year}")
BY={x["n"]:x for x in EPS}
LATEST=sorted(EPS,key=lambda x:DATES[x["n"]],reverse=True)
NEWEST=LATEST[0]
def pb(ep,pre,cls="rp",label="شغّل",text=""):
    n=ep["n"]
    return f'<button class="{cls}" data-play="{n}" data-src="{pre}audio/{n}.mp3" data-title="{e(ep["title"])}" data-url="{pre}ep/{n}.html" aria-label="{label} {e(ep["title"])}">{text}</button>'
def head(title,pre,cls="",desc="ف الكلامِ كلام، بودكاست تقديم ملك فرج."):
    return f'''<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}">
<meta property="og:title" content="{e(title)}"><meta property="og:image" content="{pre}logo.jpg"><link rel="icon" href="{pre}logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Reem+Kufi:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{pre}style.css"><script>document.documentElement.className="js";try{{var q=location.search.match(/lang=(ar|en)/);if(q)localStorage.setItem("lang",q[1]);var L=localStorage.getItem("lang")||((navigator.language||"ar").slice(0,2)=="ar"?"ar":"en");document.documentElement.setAttribute("data-lang",L)}}catch(e){{}}</script></head><body class="{cls}">
<header class="top"><a class="lg" href="{pre}index.html" aria-label="ف الكلامِ كلام"><img src="{pre}logo-t.png" alt="ف الكلامِ كلام"></a>
<nav><a href="{pre}episodes.html">الحلقات</a><a href="{pre}space.html">{SPACE_NAME}</a><a href="{pre}about.html">عنّا</a><a href="{pre}contact.html">تواصل</a><a class="sr" href="{pre}episodes.html#q" aria-label="بحث"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></a><button class="lsw" type="button" aria-label="Language"><b data-l="ar">AR</b><i>|</i><b data-l="en">EN</b></button></nav></header>
<main>'''
def foot(pre):
    return f'''</main><footer><div class="fw"><span class="fl"><a href="{pre}contact.html">تواصل</a><a href="{YT}" target="_blank" rel="noopener">يوتيوب</a><a href="https://www.instagram.com/inspeechtalk" target="_blank" rel="noopener">إنستجرام</a><a href="https://www.facebook.com/share/1BJq657VJj/" target="_blank" rel="noopener">فيسبوك</a></span></div></footer>
<script src="{pre}app.js" defer></script><script src="{pre}i18n.js" defer></script></body></html>'''
def words(s):
    return "".join(f'<span class="w" style="--i:{i}">{e(w)}</span> ' for i,w in enumerate(s.split()))
def sdata(ep): return e(" ".join([ep["title"],ep["hook"],TOPICS[ep["topic"]],ep["word"]]+ep["desc"]))
def ephead(ep):
    n=ep["n"]
    if os.path.exists(f"thumbs/{n}.jpg"):
        return f'<img class="eth" src="../thumbs/{n}.jpg" alt="{e(ep["title"])}" width="1280" height="720">'
    if ep.get("vid") and ep.get("thumb")=="yt":
        return f'<img class="eth" src="https://i.ytimg.com/vi/{ep["vid"]}/maxresdefault.jpg" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/{ep["vid"]}/hqdefault.jpg\'" alt="{e(ep["title"])}" width="1280" height="720">'
    return f'<div class="eth etile"><img src="../logo.png" alt="" class="al"><span class="ak">الحلقة</span><span class="an">{ar(n)}</span><span class="at">{e(ep["title"])}</span></div>'
def row(ep,pre):
    return f'''<article class="row" data-s="{sdata(ep)}">{pb(ep,pre)}<span class="num">{ar(ep["n"])}</span>
<a class="rt" href="{pre}ep/{ep["slug"]}.html"><b>{e(ep["title"])}</b><i>{e(ep["hook"])}</i><em>{dfmt(ep["n"])} · {ar(ep["len"])}</em></a><span class="rw" aria-hidden="true">{e(ep["word"])}</span></article>'''
def player(ep,pre):
    n=ep["n"]
    return f'''<div class="ply" data-n="{n}" data-src="{pre}audio/{n}.mp3" data-title="{e(ep["title"])}" data-url="{pre}ep/{n}.html">
<div class="top2"><button class="pp" aria-label="شغّل / وقّف"></button><div class="mid"><div class="lbl">{e(ep["title"])}</div>
<div class="bar" role="slider" aria-label="موضع التشغيل" tabindex="0"><i></i></div><div class="tm"><span class="cur">0:00</span><span class="tot">{ep["len"]}</span></div></div></div>
<div class="ctl"><button class="sk" data-s="-15" aria-label="رجوع ١٥ ثانية">−15</button><button class="sk" data-s="15" aria-label="تقديم ١٥ ثانية">+15</button><button class="spd" aria-label="سرعة التشغيل">1×</button><button class="sh">شارك</button><a class="dl" href="{pre}audio/{n}.mp3" download="ف الكلامِ كلام - {n}.mp3">تحميل</a><label class="vol">الصوت <input type="range" min="0" max="1" step="0.05" value="1" aria-label="مستوى الصوت"></label></div></div>'''
def quote_list(items,pre,limit=None):
    out=""
    for k,t,n in (items[:limit] if limit else items):
        out+=f'<li class="tq"><small>{k}</small><p>{e(t)}</p><a href="{pre}ep/{n}.html">من حلقة {e(BY[n]["title"])} ←</a></li>'
    return f'<ul class="tqs">{out}</ul>'
def askform(idp="askf"):
    return f'''<form id="{idp}" class="wf" novalidate><input type="hidden" name="access_key" value="{KEY}"><input type="hidden" name="subject" value="سؤال الفترة دي - ف الكلامِ كلام">
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off">
<div class="types" role="radiogroup"><label><input type="radio" name="type" value="إجابة" checked><span>إجابتي</span></label><label><input type="radio" name="type" value="اعتراف"><span>اعتراف</span></label><label><input type="radio" name="type" value="حلقة نفسي أسمع عنها"><span>سؤال نفسي أسمع عنه حلقة</span></label></div>
<textarea name="message" rows="4" required placeholder="اكتب هنا..." aria-label="إجابتك"></textarea>
<div class="rowf"><input name="name" placeholder="اسمك (لو حابب، ولو مكتبتش هتفضل مجهول)" autocomplete="off"><button class="btn pri" type="submit">ابعت</button></div>
<label class="cons"><input type="checkbox" name="consent" value="yes"><span>موافق إن إجابتي تتنشر أو تتستخدم في حلقة لو اتختارت</span></label>
<p class="msg" role="status" aria-live="polite"></p></form>'''
def hero_pills(): return '<div class="pills" aria-hidden="true"><i class="pl1"></i><i class="pl2"></i><i class="pl3"></i><b class="dots">· · ·</b></div>'

os.makedirs("ep",exist_ok=True)
# ---------- HOME
nw=NEWEST
topics_html="".join(f'<a class="tp" href="episodes.html#topics"><span>{e(t)}</span><b>{ar(len([x for x in EPS if x["topic"]==i]))} حلقات</b></a>' for i,t in enumerate(TOPICS))
idx=head("ف الكلامِ كلام","",cls="home")+f'''
<section class="hero">{hero_pills()}<img class="mark" src="logo-t.png" alt="">
<h1 class="split"><span class="l">{words("مش كل حاجة بنفكر فيها…")}</span><span class="l o">{words("بنقولها.")}</span><span class="l s">{words("بس هنا، هنقول شوية منها.")}</span></h1>
<div class="cta">{pb(nw,"","btn pri bp","اسمع آخر حلقة","اسمع آخر حلقة")}<a class="btn" href="episodes.html">ادخل واتفرج براحتك</a></div><div class="scroll" aria-hidden="true"></div></section>

<section class="feat rv"><div class="wrap fg">
<div class="art"><img src="logo.png" alt="" class="al"><span class="ak">الحلقة</span><span class="an">{ar(nw["n"])}</span><span class="at">{e(nw["title"])}</span></div>
<div class="fx"><small class="lab">آخر حلقة · {e(TOPICS[nw["topic"]])}</small><h2>{e(nw["title"])}</h2><p>{e(nw["hook"])}</p>
<div class="fm">{dfmt(nw["n"])} · {ar(nw["len"])}</div>
<div class="cta2">{pb(nw,"","btn pri bp","شغّل","شغّل الحلقة")}<a class="btn" href="ep/{nw["slug"]}.html">صفحة الحلقة</a></div></div></div></section>

<section class="blk rv"><div class="wrap"><h2 class="h">آخر الحلقات</h2><div class="rows">{"".join(row(x,"") for x in LATEST[1:4])}</div>
<a class="all" href="episodes.html">كل الحلقات ←</a>
<div class="tps">{topics_html}</div></div></section>

<section class="blk rv"><div class="wrap"><small class="lab">{SPACE_NAME}</small><h2 class="h">كلام برا الحلقات</h2>{quote_list(SNIPS,"",3)}
<a class="all" href="space.html">كمّل ←</a></div></section>

<section class="ask rv" id="ask"><div class="in"><small class="lab">سؤال الفترة دي</small>
<h2>إيه فكرة مش قادر تبطل تفكر فيها الفترة دي؟</h2>{askform()}</div></section>'''+foot("")
open("index.html","w",encoding="utf-8").write(idx)

# ---------- EPISODES
tabs='<div class="tabs" role="tablist"><button data-v="latest" class="on">الأحدث</button><button data-v="all">كل الحلقات</button><button data-v="topics">المواضيع</button></div>'
v_latest="".join(row(x,"") for x in LATEST)
v_all="".join(row(x,"") for x in EPS)
v_top="".join(f'<h2 class="tt" id="t{i}">{e(t)}</h2><div class="rows">'+"".join(row(x,"") for x in EPS if x["topic"]==i)+'</div>' for i,t in enumerate(TOPICS))
arch=head("الحلقات | ف الكلامِ كلام","",cls="arch")+f'''<section class="wrap pg"><h1 class="big">الحلقات</h1>
<div class="sbar"><input id="q" type="search" placeholder="دوّر باسم الحلقة أو كلمة أو موضوع" aria-label="بحث"></div>{tabs}
<div class="view on rows" data-v="latest">{v_latest}</div><div class="view rows" data-v="all">{v_all}</div><div class="view" data-v="topics">{v_top}</div>
<p class="none" hidden>مفيش حلقة بالكلمة دي.</p></section>'''+foot("")
open("episodes.html","w",encoding="utf-8").write(arch)

# ---------- EPISODE PAGES
for ep in EPS:
    n=ep["n"]; pre="../"
    srt=[x["n"] for x in LATEST]
    desc="".join(f"<p>{e(p)}</p>" for p in ep["desc"])
    tr=""
    if n in TRANSCRIPTS:
        tr='<section class="tr"><details><summary><span>نص الحلقة</span><i>اقرا النص</i></summary><div class="tb">'+"".join(f"<p>{e(p)}</p>" for p in TRANSCRIPTS[n])+'</div></details></section>'
    rel=[x for x in LATEST if x["topic"]==ep["topic"] and x["n"]!=n]
    rel+= [x for x in LATEST if x["n"]!=n and x not in rel]
    rel=rel[:3]
    ordn=sorted(PUB); ix=ordn.index(n); prev=BY.get(ordn[ix-1]) if ix>0 else None; nxt=BY.get(ordn[ix+1]) if ix<len(ordn)-1 else None
    nav=""
    if prev: nav+=f'<a href="{prev["slug"]}.html"><small>الحلقة اللي قبلها</small>{e(prev["title"])}</a>'
    if nxt: nav+=f'<a class="nx" href="{nxt["slug"]}.html"><small>الحلقة اللي بعدها</small>{e(nxt["title"])}</a>'
    page=head(f'{ep["title"]} | ف الكلامِ كلام',pre,cls="ep "+ep["theme"],desc=ep["hook"])+f'''
<section class="eh"><div class="bgw" aria-hidden="true">{e(ep["word"])}</div>
<div class="wrap"><a class="back" href="../episodes.html">← الحلقات</a>
<small class="lab">{e(TOPICS[ep["topic"]])} · الحلقة {ar(n)}</small>
{ephead(ep)}<h1>{e(ep["title"])}</h1><div class="em">{dfmt(n)} · {ar(ep["len"])} · <span>#{e(ep["word"])}</span> <span>#{e(TOPICS[ep["topic"]].replace(" ","_"))}</span></div></div></section>
<section class="wrap body"><div class="d">{desc}</div>
<div class="pl">{player(ep,pre)}<div class="lis"><span>تسمعها كمان على:</span><a href="{YT}" target="_blank" rel="noopener">يوتيوب</a></div></div></section>
<section class="qt"><div class="wrap"><blockquote>{e(ep["quote"])}</blockquote></div></section>
{tr}
<section class="wrap rel"><h2 class="h2">حلقات قريبة</h2><div class="rows">{"".join(row(x,pre) for x in rel)}</div></section>
<section class="wrap pn">{nav}</section>
'''+foot(pre)
    open(f"ep/{ep['slug']}.html","w",encoding="utf-8").write(page)

# ---------- SPACE
qs=[s for s in SNIPS if s[0]=="سؤال"]; qq=[s for s in SNIPS if s[0]=="اقتباس"]
soon='<p class="soon">قريبًا.</p>'
sp=head(f"{SPACE_NAME} | ف الكلامِ كلام","",cls="space")+f'''<section class="wrap pg"><h1 class="big">{SPACE_NAME}</h1>
<p class="intro">أفكار صغيرة، كلام جه في بالك، أسئلة ملهاش إجابة، اقتباسات، وحاجات مش كفاية إنها تبقى حلقة كاملة بس تستحق تتقال.</p>
<h2 class="tt">أسئلة</h2>{quote_list(qs,"")}<h2 class="tt">اقتباسات</h2>{quote_list(qq,"")}
<h2 class="tt">خواطر</h2>{soon}<h2 class="tt">فويس نوتس</h2>{soon}</section>'''+foot("")
open("space.html","w",encoding="utf-8").write(sp)

# ---------- ABOUT
ab=head("عنّا | ف الكلامِ كلام","",cls="about")+'''<section class="wrap pg"><div class="ab2">
<p class="lead"><b>مش كل كلام بيتقال... بيكون مجرد كلام.</b></p>
<p><b>ف الكلامِ كلام – In Speech Talk</b> هو مساحة بنفتح فيها مواضيع بنعيشها كل يوم، لكن مش دايمًا بناخد وقت نفكر فيها بعمق.</p>
<p>عن نفسنا، عن علاقاتنا، عن اختياراتنا، عن المشاعر اللي مش بنعرف نفسرها، وعن أفكار أوقات كتير بنحتاج نسمعها من زاوية مختلفة.</p>
<p>هنا مش بنقدم إجابات مثالية، ولا بنقولك تعيش إزاي.</p>
<p>إحنا بنطرح أسئلة، بنناقش أفكار، وبنحاول نفهم نفسنا والحياة بشكل أوضح.</p>
<p>من الاستحقاق والوعي والنضج، لحد الخوف والمقارنة والتغيير... كل حلقة هي فرصة إنك تقف شوية وسط زحمة الحياة، وتفكر.</p>
<p class="en" dir="ltr"><b>Because sometimes, one conversation can change the way you see things.</b></p>
<figure class="who2"><div class="ph"><img src="malak.jpg" alt="ملك فرج"></div></figure>
<p>أنا ملك فرج، ودي مساحتي للكلام عن كل الحاجات اللي فعلًا تستاهل نتكلم فيها.</p>
<p class="wel"><b>أهلًا بيك في ف الكلامِ كلام.</b></p>
</div></section>'''+foot("")
open("about.html","w",encoding="utf-8").write(ab)

# ---------- CONTACT
ct=head("تواصل | ف الكلامِ كلام","",cls="contact")+f'''<section class="wrap pg"><h1 class="big">تواصل</h1>
<div class="cg"><div><h2 class="tt">ابعتلنا</h2>
<form id="cf" class="wf light" novalidate><input type="hidden" name="access_key" value="{KEY}"><input type="hidden" name="subject" value="رسالة من الموقع - ف الكلامِ كلام">
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off">
<div class="types" role="radiogroup"><label><input type="radio" name="type" value="اقتراح موضوع" checked><span>اقتراح موضوع</span></label><label><input type="radio" name="type" value="تعاون"><span>تعاون</span></label><label><input type="radio" name="type" value="رسالة"><span>رسالة</span></label></div>
<textarea name="message" rows="5" required placeholder="اكتب هنا..." aria-label="رسالتك"></textarea>
<div class="rowf"><input name="name" placeholder="اسمك (اختياري)" autocomplete="off"><button class="btn pri" type="submit">ابعت</button></div>
<p class="msg" role="status" aria-live="polite"></p></form></div>
<div><h2 class="tt">السوشيال</h2><ul class="soc"><li><a href="{YT}" target="_blank" rel="noopener">يوتيوب <span>@inspeechtalkk</span></a></li><li><a href="https://www.instagram.com/inspeechtalk" target="_blank" rel="noopener">إنستجرام <span>@inspeechtalk</span></a></li><li><a href="https://www.facebook.com/share/1BJq657VJj/" target="_blank" rel="noopener">فيسبوك</a></li></ul></div></div></section>'''+foot("")
open("contact.html","w",encoding="utf-8").write(ct)
print("ok")

# remove pages of episodes that are hidden or gone
for f in os.listdir("ep"):
    if f.endswith(".html") and f[:-5] not in {z["slug"] for z in EPS}: os.remove("ep/"+f)
