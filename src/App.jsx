import { useState } from "react";

// ── Тема ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f5f6fa", card: "#fff", cardAlt: "#f0f2f5", border: "#eee",
  text: "#1a1a2e", textSec: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenLight: "#dcfce7", greenBorder: "#bbf7d0",
  orange: "#f97316", yellow: "#eab308", accent: "#22c55e",
  purple: "#8b5cf6", blue: "#3b82f6",
  radius: 16, radiusSm: 12,
};

const S = {
  card: { background: T.card, borderRadius: T.radius, padding: 14, border: `1px solid ${T.border}22` },
  btn: { border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  flex: { display: "flex", alignItems: "center" },
  page: { padding: "16px 16px 90px" },
};

// ── SVG Іконки ──────────────────────────────────────────────────────────────
const I = {
  home: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  bag: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  qr: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4"/><line x1="22" y1="14" x2="22" y2="22"/><line x1="18" y1="22" x2="22" y2="22"/></svg>,
  chart: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  wallet: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  back: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  user: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  lock: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  phone: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  check: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  share: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  filter: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  copy: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  plus: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  cam: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  star: <svg width="14" height="14" fill="#eab308" stroke="#eab308" strokeWidth="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  pin: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  down: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

// ── Дані ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"all", label:"Всі", icon:"🏪" }, { id:"farm", label:"Ферма", icon:"🐔" },
  { id:"honey", label:"Мед", icon:"🍯" }, { id:"veggies", label:"Городина", icon:"🥬" },
  { id:"dairy", label:"Молочне", icon:"🥛" }, { id:"food", label:"Випічка", icon:"🍞" },
  { id:"handmade", label:"Handmade", icon:"🧵" }, { id:"cafe", label:"Кафе", icon:"☕" },
];

const INIT_DEALS = [
  { id:1,cat:"farm",seller:"Ферма Петренків",avatar:"🌾",city:"Бориспіль",rating:4.9,deals:34,title:"Курчата бройлер живою вагою",unit:"кг",retail:95,group:68,min:2,max:10,joined:18,needed:30,days:3,desc:"Вирощені без антибіотиків. Природний корм.",tags:["Без антибіотиків","Доставка Київ","від 2 кг"],hot:true },
  { id:2,cat:"honey",seller:"Пасіка Коваля",avatar:"🐝",city:"Черкаси",rating:5.0,deals:67,title:"Акацієвий мед з пасіки",unit:"банка 1л",retail:380,group:260,min:1,max:5,joined:22,needed:25,days:1,desc:"Якісний світлий мед. Сертифікат якості.",tags:["Сертифікат","Акація 2024","Нова Пошта"],hot:true },
  { id:3,cat:"food",seller:"Пекарня Оленки",avatar:"👩‍🍳",city:"Київ",rating:4.8,deals:89,title:"Набір домашньої випічки (12 шт)",unit:"набір",retail:320,group:210,min:1,max:3,joined:9,needed:15,days:2,desc:"Круасани, булочки з маком, рогалики.",tags:["Щопонеділка","Домашній рецепт","Самовивіз"],hot:false },
  { id:4,cat:"veggies",seller:"Город дядька Миколи",avatar:"👨‍🌾",city:"Вишгород",rating:4.7,deals:21,title:"Картопля молода власного врожаю",unit:"кг",retail:28,group:17,min:5,max:50,joined:41,needed:50,days:2,desc:"Сорт Беллароза. Без хімії.",tags:["Без хімії","Власний врожай","від 5 кг"],hot:true },
  { id:5,cat:"dairy",seller:"Молочна від Галини",avatar:"🐄",city:"Бровари",rating:4.9,deals:112,title:"Домашній сир та сметана",unit:"набір",retail:280,group:195,min:1,max:4,joined:7,needed:20,days:4,desc:"Сир 500г + сметана 400г.",tags:["Від однієї корови","Вт та Пт","Доставка"],hot:false },
  { id:6,cat:"handmade",seller:"Майстерня Тетяни",avatar:"🧶",city:"Київ",rating:4.6,deals:45,title:"Вишита сорочка (замовлення групою)",unit:"шт",retail:1800,group:1200,min:1,max:1,joined:6,needed:10,days:7,desc:"Ручна вишивка. Розміри S-XL.",tags:["Ручна робота","S-XL","Авторська"],hot:false },
  { id:7,cat:"cafe",seller:"Кав'ярня Зерно",avatar:"☕",city:"Київ",rating:4.8,deals:203,title:"Купон: будь-яка кава × 5",unit:"купон",retail:175,group:110,min:1,max:10,joined:44,needed:50,days:1,desc:"Еспресо, лате, капучіно. 60 днів.",tags:["Будь-яка кава","60 днів","Саксаганського 15"],hot:true },
  { id:8,cat:"farm",seller:"Ферма Петренків",avatar:"🌾",city:"Бориспіль",rating:4.9,deals:34,title:"Яйця домашні (лоток 30 шт)",unit:"лоток",retail:145,group:95,min:1,max:5,joined:12,needed:20,days:3,desc:"Несучки вільного вигулу.",tags:["Вільний вигул","Яскравий жовток","Доставка"],hot:false },
  { id:9,cat:"veggies",seller:"Еко-ферма Зелений Гай",avatar:"🥕",city:"Фастів",rating:4.8,deals:56,title:"Набір сезонних овочів (10 кг)",unit:"набір",retail:450,group:290,min:1,max:5,joined:15,needed:25,days:4,desc:"Помідори, огірки, перець, морква.",tags:["Сезонне","Органік","10 кг"],hot:true },
  { id:10,cat:"dairy",seller:"Сироварня Карпат",avatar:"🧀",city:"Львів",rating:4.9,deals:78,title:"Набір крафтових сирів (5 видів)",unit:"набір",retail:680,group:450,min:1,max:3,joined:8,needed:15,days:5,desc:"Бринза, сулугуні, качотта, камамбер, рікотта.",tags:["Карпатське","5 видів","Термопакування"],hot:false },
  { id:11,cat:"food",seller:"Кондитерська Солодка",avatar:"🎂",city:"Одеса",rating:4.7,deals:134,title:"Набір тістечок преміум (8 шт)",unit:"набір",retail:520,group:340,min:1,max:4,joined:19,needed:20,days:1,desc:"Наполеон, еклери, тірамісу.",tags:["Преміум","Нова Пошта","Щодня"],hot:true },
  { id:12,cat:"farm",seller:"Рибне господарство Дніпро",avatar:"🐟",city:"Дніпро",rating:4.6,deals:42,title:"Форель свіжа (охолоджена)",unit:"кг",retail:420,group:280,min:2,max:8,joined:11,needed:20,days:3,desc:"Райдужна форель без ГМО.",tags:["Свіжа","Чиста вода","від 2 кг"],hot:false },
  { id:13,cat:"honey",seller:"Пасіка Лісова",avatar:"🌻",city:"Полтава",rating:5.0,deals:91,title:"Мед соняшниковий + пилок",unit:"набір",retail:320,group:210,min:1,max:6,joined:28,needed:30,days:2,desc:"Мед 1л + квітковий пилок 200г.",tags:["Соняшник","+ Пилок","Сертифікат"],hot:true },
  { id:14,cat:"cafe",seller:"Чайна Майстерня",avatar:"🍵",city:"Київ",rating:4.8,deals:167,title:"Набір китайського чаю (6 сортів)",unit:"набір",retail:890,group:590,min:1,max:3,joined:5,needed:12,days:6,desc:"Пуер, улун, жасмин та інші.",tags:["6 сортів","Китай","Подарункова"],hot:false },
  { id:15,cat:"handmade",seller:"Свічкова Мануфактура",avatar:"🕯",city:"Харків",rating:4.7,deals:63,title:"Набір ароматичних свічок (4 шт)",unit:"набір",retail:560,group:380,min:1,max:5,joined:13,needed:18,days:4,desc:"Соєвий віск. Лаванда, ваніль, кедр, цитрус.",tags:["Соєвий віск","Натуральні","В коробці"],hot:false },
];

const SELLER = { name:"Ферма Петренків",avatar:"🌾",fop:"ФОП Петренко Василь Іванович",ipn:"3456789012",iban:"UA213223130000026007233566001",bank:"АТ КБ «ПриватБанк»",group:"2 група",taxRate:"₴1,600/міс",city:"Бориспіль",rating:4.9 };
const TRANSACTIONS = [
  { id:"T1",type:"income",desc:"Курчата × 4кг (Олена В.)",amount:272,date:"24.03 · 14:22" },
  { id:"T2",type:"income",desc:"Яйця × 2 лотки (Микола І.)",amount:190,date:"24.03 · 11:05" },
  { id:"T3",type:"withdrawal",desc:"Виведення на IBAN",amount:3200,date:"23.03 · 18:00" },
  { id:"T4",type:"hold",desc:"Очікує видачі",amount:272,date:"24.03 · 10:15" },
];
const ORDERS = [
  { id:"SC-8841",buyer:"Олена Василенко",avatar:"👩",item:"Курчата бройлер",qty:4,unit:"кг",amount:272,status:"paid" },
  { id:"SC-8842",buyer:"Микола Іваненко",avatar:"👨",item:"Яйця домашні",qty:2,unit:"лотки",amount:190,status:"done" },
  { id:"SC-8843",buyer:"Ірина Коваль",avatar:"👩‍🦱",item:"Курчата бройлер",qty:6,unit:"кг",amount:408,status:"paid" },
];

const pct = d => Math.min(100, Math.round((d.joined / d.needed) * 100));
const disc = d => Math.round(((d.retail - d.group) / d.retail) * 100);
const pCol = p => p >= 90 ? T.orange : p >= 60 ? T.yellow : T.accent;

// ── Декоративний фон ────────────────────────────────────────────────────────
function BgDecor() {
  return <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden",pointerEvents:"none",zIndex:0 }}>
    <div style={{ position:"absolute",top:-60,right:-40,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.08),transparent 70%)" }}/>
    <div style={{ position:"absolute",top:"40%",left:-60,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.06),transparent 70%)" }}/>
    <div style={{ position:"absolute",bottom:100,right:-30,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.06),transparent 70%)" }}/>
    <svg style={{ position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.04 }}><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={T.accent}/><stop offset="50%" stopColor={T.purple}/><stop offset="100%" stopColor={T.blue}/></linearGradient></defs>
      <path d="M0 200Q100 150 200 220T400 180" fill="none" stroke="url(#g1)" strokeWidth="2"/>
      <path d="M0 400Q150 350 250 420T400 380" fill="none" stroke="url(#g1)" strokeWidth="1.5"/>
      <path d="M0 600Q120 550 220 620T400 580" fill="none" stroke="url(#g1)" strokeWidth="1"/>
    </svg>
  </div>;
}

// ── UI компоненти ───────────────────────────────────────────────────────────
function Badge({ children, bg = T.greenLight, color = T.green }) {
  return <span style={{ background:bg,color,fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:8 }}>{children}</span>;
}
function ProgressBar({ value, color = T.accent, h = 5 }) {
  return <div style={{ height:h,background:T.cardAlt,borderRadius:h,overflow:"hidden" }}><div style={{ height:"100%",width:`${value}%`,background:color,borderRadius:h,transition:"width .4s" }}/></div>;
}
function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ ...S.btn,...S.flex,gap:4,background:"none",color:T.green,fontSize:14,padding:0,marginBottom:16 }}>{I.back} Назад</button>;
}
function Ic({ emoji, size = 36 }) {
  return <div style={{ fontSize:size*0.55,width:size,height:size,background:T.cardAlt,borderRadius:T.radiusSm,...S.flex,justifyContent:"center" }}>{emoji}</div>;
}
function Input({ value, onChange, placeholder, icon, type="text", area }) {
  const common = { width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:icon?"12px 16px 12px 42px":"12px 16px",color:T.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit" };
  return <div style={{ position:"relative" }}>
    {icon&&<div style={{ position:"absolute",left:14,top:area?14:"50%",transform:area?"none":"translateY(-50%)",color:T.textMuted }}>{icon}</div>}
    {area ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} style={{ ...common,resize:"vertical" }}/> :
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={common}/>}
  </div>;
}

// ── Навігація (напівпрозора + анімація) ─────────────────────────────────────
const NAV = [["market",I.home,"Маркет"],["my",I.bag,"Мої"],["qr",I.qr,"QR"],["seller",I.chart,"Бізнес"],["wallet",I.wallet,"Гаманець"]];

function Nav({ tab, setTab }) {
  return <div style={{ position:"absolute",bottom:0,left:0,right:0,height:72,background:"rgba(255,255,255,0.55)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:`1px solid rgba(0,0,0,0.04)`,...S.flex,zIndex:100,padding:"0 4px" }}>
    {NAV.map(([t,icon,label])=>(
      <button key={t} onClick={()=>setTab(t)} style={{ ...S.btn,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:"transparent",color:tab===t?T.green:T.textMuted,transition:"all .25s",transform:tab===t?"scale(1.15)":"scale(1)" }}>
        {icon}
        <span style={{ fontSize:9,fontWeight:tab===t?800:600,letterSpacing:tab===t?0.5:0 }}>{label}</span>
        {tab===t&&<div style={{ width:20,height:3,background:`linear-gradient(90deg,${T.accent},${T.purple})`,borderRadius:2,marginTop:-1 }}/>}
      </button>
    ))}
  </div>;
}

// ── Welcome + Реєстрація ────────────────────────────────────────────────────
function WelcomeScreen({ onStart, onGuest }) {
  return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:24,textAlign:"center" }}>
    <div style={{ fontSize:56,marginBottom:12 }}>🛒</div>
    <h1 style={{ fontSize:28,fontWeight:900,color:T.text,marginBottom:6 }}>СпільноКуп</h1>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:28,lineHeight:1.6 }}>Спільні покупки від малого бізнесу України.<br/>Економте до 40% купуючи разом!</p>
    <button onClick={onStart} style={{ ...S.btn,width:"100%",padding:15,background:`linear-gradient(135deg,${T.accent},${T.green})`,color:"#fff",borderRadius:14,fontSize:15,marginBottom:10 }}>Створити акаунт</button>
    <button onClick={onStart} style={{ ...S.btn,width:"100%",padding:14,background:"transparent",color:T.green,borderRadius:14,fontSize:13,border:`1px solid ${T.border}`,marginBottom:10 }}>Вже маю акаунт</button>
    <button onClick={onGuest} style={{ ...S.btn,width:"100%",padding:14,background:T.cardAlt,color:T.textSec,borderRadius:14,fontSize:13 }}>Увійти як гість</button>
    <div style={{ marginTop:28,background:T.cardAlt,borderRadius:T.radius,padding:14,textAlign:"left" }}>
      <div style={{ ...S.flex,gap:6,fontSize:12,fontWeight:700,color:T.text,marginBottom:6 }}>{I.down} Додати на екран:</div>
      <div style={{ fontSize:11,color:T.textSec,lineHeight:1.8 }}><b>Android:</b> Chrome → ⋮ → «На головний екран»<br/><b>iPhone:</b> Safari → ⬆ → «На Початковий екран»</div>
    </div>
  </div>;
}

function RegisterScreen({ onDone }) {
  const [step,setStep]=useState(0),[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[pass,setPass]=useState(""),[city,setCity]=useState(""),[code,setCode]=useState("");
  if(step===0) return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",padding:24 }}>
    <BackBtn onClick={()=>{}}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Реєстрація</h2>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20 }}>Крок 1 з 3</p>
    <div style={{ display:"flex",flexDirection:"column",gap:12,flex:1 }}>
      <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Ваше ім'я" icon={I.user}/>
      <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" icon={I.mail} type="email"/>
      <Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+380" icon={I.phone} type="tel"/>
      <Input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Пароль" icon={I.lock} type="password"/>
    </div>
    <button onClick={()=>setStep(1)} disabled={!name||!email||!phone||!pass} style={{ ...S.btn,width:"100%",padding:15,background:(name&&email&&phone&&pass)?T.accent:T.cardAlt,color:(name&&email&&phone&&pass)?"#fff":T.textMuted,borderRadius:14,fontSize:15,marginTop:20 }}>Далі</button>
  </div>;
  if(step===1) return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",padding:24 }}>
    <BackBtn onClick={()=>setStep(0)}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Місто</h2>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20 }}>Крок 2 з 3</p>
    <Input value={city} onChange={e=>setCity(e.target.value)} placeholder="Ваше місто"/>
    <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:14 }}>
      {["Київ","Харків","Одеса","Дніпро","Львів","Бориспіль","Бровари","Черкаси","Полтава"].map(c=>
        <button key={c} onClick={()=>setCity(c)} style={{ ...S.btn,padding:"7px 12px",borderRadius:10,fontSize:11,background:city===c?T.accent:T.cardAlt,color:city===c?"#fff":T.textSec }}>{c}</button>
      )}
    </div>
    <div style={{ flex:1 }}/>
    <button onClick={()=>setStep(2)} disabled={!city} style={{ ...S.btn,width:"100%",padding:15,background:city?T.accent:T.cardAlt,color:city?"#fff":T.textMuted,borderRadius:14,fontSize:15,marginTop:20 }}>Далі</button>
  </div>;
  return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",padding:24 }}>
    <BackBtn onClick={()=>setStep(1)}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Підтвердження</h2>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20 }}>Крок 3 з 3 — SMS код</p>
    <div style={{ ...S.card,background:T.greenLight,textAlign:"center",marginBottom:16 }}><div style={{ fontSize:12,color:T.green }}>Код надіслано на {phone}</div></div>
    <div style={{ ...S.flex,justifyContent:"center",gap:10,marginBottom:20 }}>
      {[0,1,2,3].map(i=><input key={i} maxLength={1} value={code[i]||""} onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v){const nc=code.split("");nc[i]=v;setCode(nc.join(""));if(i<3)e.target.nextSibling?.focus();}}}
        style={{ width:50,height:56,textAlign:"center",fontSize:22,fontWeight:900,border:`2px solid ${code[i]?T.accent:T.border}`,borderRadius:12,outline:"none",color:T.text,fontFamily:"inherit" }}/>)}
    </div>
    <button onClick={()=>{if(code.length>=4)onDone({name,email,phone,city});}} disabled={code.length<4}
      style={{ ...S.btn,width:"100%",padding:15,background:code.length>=4?T.accent:T.cardAlt,color:code.length>=4?"#fff":T.textMuted,borderRadius:14,fontSize:15 }}>Підтвердити</button>
  </div>;
}

// ── Картка угоди ────────────────────────────────────────────────────────────
function DealCard({ deal, onOpen, joined, onJoin }) {
  const p=pct(deal),d=disc(deal),isIn=joined[deal.id],col=pCol(p);
  return <div onClick={()=>onOpen(deal)} style={{ ...S.card,borderRadius:18,overflow:"hidden",cursor:"pointer",borderColor:isIn?T.accent+"33":"transparent",boxShadow:deal.hot?"0 2px 16px rgba(249,115,22,0.06)":"0 1px 4px rgba(0,0,0,0.03)" }}>
    <div style={{ ...S.flex,gap:6,padding:"8px 12px 0" }}>
      {deal.hot&&<Badge bg={T.orange} color="#fff">HOT</Badge>}
      <span style={{ marginLeft:"auto" }}><Badge>-{d}%</Badge></span>
    </div>
    <div style={{ padding:"8px 12px 12px" }}>
      <div style={{ ...S.flex,gap:8,marginBottom:8 }}>
        <Ic emoji={deal.avatar} size={32}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11,fontWeight:700,color:T.text }}>{deal.seller}</div>
          <div style={{ ...S.flex,gap:4,fontSize:10,color:T.textSec }}>{I.pin} {deal.city} {I.star} {deal.rating}</div>
        </div>
        {isIn&&<div style={{ width:24,height:24,background:T.accent,borderRadius:"50%",...S.flex,justifyContent:"center",color:"#fff" }}>{I.check}</div>}
      </div>
      <div style={{ fontSize:14,fontWeight:800,color:T.text,marginBottom:6,lineHeight:1.3 }}>{deal.title}</div>
      <div style={{ ...S.flex,gap:6,marginBottom:10 }}>
        <span style={{ fontSize:20,fontWeight:900,color:T.green }}>₴{deal.group}</span>
        <span style={{ fontSize:11,color:T.textMuted,textDecoration:"line-through" }}>₴{deal.retail}</span>
        <span style={{ fontSize:10,color:T.textSec }}>/ {deal.unit}</span>
      </div>
      <div style={{ marginBottom:6 }}>
        <div style={{ ...S.flex,justifyContent:"space-between",marginBottom:4 }}>
          <span style={{ fontSize:10,color:T.textSec }}>Учасників</span>
          <span style={{ fontSize:10,fontWeight:700,color:col }}>{deal.joined}/{deal.needed}</span>
        </div>
        <ProgressBar value={p} color={col}/>
      </div>
      <div style={{ ...S.flex,justifyContent:"space-between" }}>
        <span style={{ ...S.flex,gap:3,fontSize:10,color:T.textSec }}>{I.clock} {deal.days} дн.</span>
        <button onClick={e=>{e.stopPropagation();onJoin(deal.id);}} style={{ ...S.btn,background:isIn?T.green:T.accent,color:"#fff",borderRadius:10,padding:"5px 12px",fontSize:11 }}>{isIn?"В групі":"Долучитись"}</button>
      </div>
    </div>
  </div>;
}

// ── Маркет ──────────────────────────────────────────────────────────────────
function MarketPage({ deals, joined, onJoin, onOpen, user, onCreateDeal }) {
  const [cat,setCat]=useState("all"),[search,setSearch]=useState(""),[sort,setSort]=useState("hot"),[showF,setShowF]=useState(false),[cityF,setCityF]=useState("all"),[priceF,setPriceF]=useState("all");
  const cities=["all",...new Set(deals.map(d=>d.city.split(",")[0].trim()))];
  let list=cat==="all"?deals:deals.filter(d=>d.cat===cat);
  if(search) list=list.filter(d=>(d.title+d.seller).toLowerCase().includes(search.toLowerCase()));
  if(cityF!=="all") list=list.filter(d=>d.city.includes(cityF));
  if(priceF==="low") list=list.filter(d=>d.group<200);
  else if(priceF==="mid") list=list.filter(d=>d.group>=200&&d.group<500);
  else if(priceF==="high") list=list.filter(d=>d.group>=500);
  list=[...list].sort(sort==="new"?(a,b)=>b.id-a.id:sort==="disc"?(a,b)=>disc(b)-disc(a):sort==="price"?(a,b)=>a.group-b.group:(a,b)=>pct(b)-pct(a));

  return <div style={{ position:"relative" }}>
    <div style={{ background:`linear-gradient(135deg,${T.greenLight},${T.greenBorder})`,padding:"20px 16px 16px",marginBottom:12 }}>
      <div style={{ ...S.flex,justifyContent:"space-between",marginBottom:14 }}>
        <div>
          <div style={{ fontSize:22,fontWeight:900,color:T.text }}>СпільноКуп</div>
          <div style={{ fontSize:11,color:T.green }}>{user?`${user.name}, вітаємо!`:"Купуй разом — плати менше"}</div>
        </div>
        <div style={{ background:"rgba(22,163,74,0.1)",borderRadius:T.radiusSm,padding:"6px 10px",textAlign:"center" }}>
          <div style={{ fontSize:14,fontWeight:900,color:T.green }}>₴4.28M</div>
          <div style={{ fontSize:8,color:T.green }}>зекономлено</div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6 }}>
        {[["847","продавців"],["12 430","угод"],["23","міст"]].map(([v,l],i)=>
          <div key={i} style={{ textAlign:"center" }}><div style={{ fontSize:18,fontWeight:900,color:T.green }}>{v}</div><div style={{ fontSize:9,color:T.textSec }}>{l}</div></div>
        )}
      </div>
    </div>

    <div style={{ padding:"0 16px 10px" }}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Пошук..." style={{ width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",color:T.text,fontSize:13,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }}/></div>

    <div style={{ display:"flex",gap:6,padding:"0 16px 10px",overflowX:"auto",scrollbarWidth:"none" }}>
      {CATEGORIES.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{ ...S.btn,whiteSpace:"nowrap",padding:"6px 12px",borderRadius:12,fontSize:11,background:cat===c.id?T.accent:T.card,color:cat===c.id?"#fff":T.textSec,border:`1px solid ${cat===c.id?T.accent:T.border}` }}>{c.icon} {c.label}</button>)}
    </div>

    <div style={{ ...S.flex,gap:4,padding:"0 16px 10px",flexWrap:"wrap" }}>
      {[["hot","Гарячі"],["new","Нові"],["disc","Знижка"],["price","Ціна"]].map(([s,l])=>
        <button key={s} onClick={()=>setSort(s)} style={{ ...S.btn,padding:"5px 10px",borderRadius:8,fontSize:10,background:sort===s?T.greenLight:"transparent",color:sort===s?T.green:T.textSec }}>{l}</button>
      )}
      <button onClick={()=>setShowF(!showF)} style={{ ...S.btn,...S.flex,gap:3,marginLeft:"auto",padding:"5px 10px",borderRadius:8,fontSize:10,background:showF?T.greenLight:"transparent",color:showF?T.green:T.textSec }}>{I.filter} Фільтри</button>
    </div>

    {showF&&<div style={{ ...S.card,margin:"0 16px 12px",padding:12 }}>
      <div style={{ fontSize:11,fontWeight:700,color:T.text,marginBottom:6 }}>Місто</div>
      <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:10 }}>
        {cities.map(c=><button key={c} onClick={()=>setCityF(c)} style={{ ...S.btn,padding:"4px 8px",borderRadius:6,fontSize:10,background:cityF===c?T.accent:T.cardAlt,color:cityF===c?"#fff":T.textSec }}>{c==="all"?"Всі":c}</button>)}
      </div>
      <div style={{ fontSize:11,fontWeight:700,color:T.text,marginBottom:6 }}>Ціна</div>
      <div style={{ display:"flex",gap:4 }}>
        {[["all","Будь-яка"],["low","до 200"],["mid","200-500"],["high","500+"]].map(([v,l])=>
          <button key={v} onClick={()=>setPriceF(v)} style={{ ...S.btn,padding:"4px 8px",borderRadius:6,fontSize:10,background:priceF===v?T.accent:T.cardAlt,color:priceF===v?"#fff":T.textSec }}>{l}</button>
        )}
      </div>
    </div>}

    <div style={{ padding:"0 16px 90px",display:"flex",flexDirection:"column",gap:10 }}>
      {list.map(d=><DealCard key={d.id} deal={d} onOpen={onOpen} joined={joined} onJoin={onJoin}/>)}
      {list.length===0&&<div style={{ textAlign:"center",padding:60,color:T.textMuted }}>Нічого не знайдено</div>}
    </div>

    <button onClick={onCreateDeal} style={{ ...S.btn,position:"fixed",bottom:84,right:20,width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.green})`,color:"#fff",boxShadow:"0 4px 20px rgba(34,197,94,0.3)",zIndex:90,...S.flex,justifyContent:"center" }}>{I.plus}</button>
  </div>;
}

// ── Створення оголошення ────────────────────────────────────────────────────
function CreateDealPage({ onBack, onSave }) {
  const [title,setTitle]=useState(""),[cat,setCat]=useState("farm"),[price,setPrice]=useState(""),[retail,setRetail]=useState(""),[unit,setUnit]=useState("кг"),[min,setMin]=useState("1"),[max,setMax]=useState("10"),[needed,setNeeded]=useState("20"),[days,setDays]=useState("7"),[desc,setDesc]=useState(""),[city,setCity]=useState(""),[tags,setTags]=useState("");

  const canSave = title && price && retail && city && desc;
  return <div style={S.page}>
    <BackBtn onClick={onBack}/>
    <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4 }}>Нове оголошення</h2>
    <p style={{ fontSize:12,color:T.textSec,marginBottom:16 }}>Створіть групову покупку</p>
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Назва товару"/>
      <div style={{ display:"flex",gap:8 }}>
        <div style={{ flex:1 }}><Input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Групова ціна" type="number"/></div>
        <div style={{ flex:1 }}><Input value={retail} onChange={e=>setRetail(e.target.value)} placeholder="Роздрібна ціна" type="number"/></div>
      </div>
      <div style={{ fontSize:11,fontWeight:700,color:T.text }}>Категорія</div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
        {CATEGORIES.filter(c=>c.id!=="all").map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{ ...S.btn,padding:"6px 10px",borderRadius:10,fontSize:11,background:cat===c.id?T.accent:T.cardAlt,color:cat===c.id?"#fff":T.textSec }}>{c.icon} {c.label}</button>)}
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <div style={{ flex:1 }}><Input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="Одиниця"/></div>
        <div style={{ flex:1 }}><Input value={needed} onChange={e=>setNeeded(e.target.value)} placeholder="Потрібно учасників" type="number"/></div>
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <div style={{ flex:1 }}><Input value={min} onChange={e=>setMin(e.target.value)} placeholder="Мін." type="number"/></div>
        <div style={{ flex:1 }}><Input value={max} onChange={e=>setMax(e.target.value)} placeholder="Макс." type="number"/></div>
        <div style={{ flex:1 }}><Input value={days} onChange={e=>setDays(e.target.value)} placeholder="Днів" type="number"/></div>
      </div>
      <Input value={city} onChange={e=>setCity(e.target.value)} placeholder="Місто" icon={I.pin}/>
      <Input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Опис товару..." area/>
      <Input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Теги через кому"/>
      <button onClick={()=>{if(canSave){onSave({id:Date.now(),cat,seller:"Моє оголошення",avatar:CATEGORIES.find(c=>c.id===cat)?.icon||"📦",city,rating:5.0,deals:0,title,unit,retail:+retail,group:+price,min:+min,max:+max,joined:0,needed:+needed,days:+days,desc,tags:tags?tags.split(",").map(t=>t.trim()):[],hot:false});}}}
        style={{ ...S.btn,width:"100%",padding:15,background:canSave?`linear-gradient(135deg,${T.accent},${T.green})`:T.cardAlt,color:canSave?"#fff":T.textMuted,borderRadius:14,fontSize:15 }}>Опублікувати</button>
    </div>
  </div>;
}

// ── Деталі угоди ────────────────────────────────────────────────────────────
function DealDetail({ deal, onBack, joined, onJoin, onBuy }) {
  const [qty,setQty]=useState(deal.min);
  const p=pct(deal),d=disc(deal),isIn=joined[deal.id],col=pCol(p);
  return <div style={{ paddingBottom:100 }}>
    <div style={{ background:`linear-gradient(180deg,${T.greenLight},${T.card})`,padding:"20px 16px 20px" }}>
      <BackBtn onClick={onBack}/>
      <div style={{ ...S.flex,gap:8,marginBottom:10 }}>
        {deal.hot&&<Badge bg={T.orange} color="#fff">HOT</Badge>}
        <Badge>-{d}%</Badge>
      </div>
      <h1 style={{ fontSize:20,fontWeight:900,color:T.text,margin:"0 0 14px",lineHeight:1.3 }}>{deal.title}</h1>
      <div style={{ ...S.card,background:T.greenLight,...S.flex,gap:12 }}>
        <Ic emoji={deal.avatar} size={48}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14,fontWeight:800,color:T.text }}>{deal.seller}</div>
          <div style={{ ...S.flex,gap:4,fontSize:11,color:T.textSec,marginTop:2 }}>{I.pin} {deal.city}</div>
          <div style={{ ...S.flex,gap:3,fontSize:11,color:T.yellow,marginTop:2 }}>{I.star} {deal.rating} · {deal.deals} угод</div>
        </div>
      </div>
    </div>
    <div style={{ padding:14,display:"flex",flexDirection:"column",gap:14 }}>
      <div style={{ ...S.card,background:T.greenLight }}>
        <div style={{ ...S.flex,gap:10,marginBottom:6 }}>
          <span style={{ fontSize:28,fontWeight:900,color:T.green }}>₴{deal.group}</span>
          <span style={{ fontSize:14,color:T.textMuted,textDecoration:"line-through" }}>₴{deal.retail}</span>
          <span style={{ fontSize:12,color:T.textSec }}>/ {deal.unit}</span>
        </div>
        <div style={{ fontSize:12,color:T.green }}>Економія ₴{deal.retail-deal.group} на {deal.unit}</div>
      </div>
      <div style={S.card}>
        <div style={{ ...S.flex,justifyContent:"space-between",marginBottom:10 }}>
          <div><div style={{ fontSize:10,color:T.textSec }}>Учасників</div><div style={{ fontSize:22,fontWeight:900,color:T.text }}>{deal.joined} <span style={{ fontSize:13,color:T.textMuted }}>/ {deal.needed}</span></div></div>
        </div>
        <ProgressBar value={p} color={col} h={7}/>
        <div style={{ ...S.flex,justifyContent:"space-between",fontSize:11,marginTop:6 }}>
          <span style={{ ...S.flex,gap:3,color:T.textSec }}>{I.clock} {deal.days} дн.</span>
          <span style={{ color:col,fontWeight:700 }}>{p}%</span>
        </div>
      </div>
      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
        {deal.tags.map((t,i)=><span key={i} style={{ background:T.cardAlt,color:T.textSec,fontSize:11,padding:"4px 10px",borderRadius:8 }}>{t}</span>)}
      </div>
      <div style={S.card}>
        <div style={{ fontSize:12,fontWeight:700,color:T.text,marginBottom:6 }}>Опис</div>
        <div style={{ fontSize:12,color:T.textSec,lineHeight:1.6 }}>{deal.desc}</div>
      </div>
      <button onClick={()=>{const text=`${deal.title} — ₴${deal.group} замість ₴${deal.retail}! -${d}%`;if(navigator.share)navigator.share({title:deal.title,text});else{navigator.clipboard.writeText(text);alert("Скопійовано!");}}}
        style={{ ...S.btn,...S.flex,justifyContent:"center",gap:6,width:"100%",padding:12,background:T.cardAlt,borderRadius:12,color:T.text,fontSize:12 }}>{I.share} Поділитись</button>
      {!isIn&&<div style={S.card}>
        <div style={{ fontSize:12,fontWeight:700,color:T.text,marginBottom:10 }}>Кількість ({deal.unit})</div>
        <div style={{ ...S.flex,gap:14,justifyContent:"center" }}>
          <button onClick={()=>setQty(Math.max(deal.min,qty-1))} style={{ ...S.btn,width:40,height:40,borderRadius:10,background:T.cardAlt,color:T.text,fontSize:18 }}>−</button>
          <span style={{ fontSize:26,fontWeight:900,color:T.text,width:50,textAlign:"center" }}>{qty}</span>
          <button onClick={()=>setQty(Math.min(deal.max,qty+1))} style={{ ...S.btn,width:40,height:40,borderRadius:10,background:T.accent,color:"#fff",fontSize:18 }}>+</button>
        </div>
        <div style={{ fontSize:11,color:T.textSec,marginTop:6,textAlign:"center" }}>Мін {deal.min} · Макс {deal.max}</div>
      </div>}
    </div>
    <div style={{ position:"fixed",bottom:0,left:0,right:0,padding:"10px 16px 20px",background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}22`,zIndex:50 }}>
      {isIn?<div style={{ ...S.flex,gap:8 }}>
        <div style={{ flex:1,background:T.greenLight,borderRadius:12,padding:12,textAlign:"center" }}><div style={{ fontSize:13,fontWeight:800,color:T.green }}>В групі!</div></div>
        <button onClick={()=>onBuy(deal,qty)} style={{ ...S.btn,background:"#6366f1",color:"#fff",borderRadius:12,padding:"12px 18px",fontSize:12 }}>QR</button>
      </div>:<button onClick={()=>{onJoin(deal.id);onBuy(deal,qty);}} style={{ ...S.btn,width:"100%",padding:14,background:`linear-gradient(135deg,${T.accent},${T.green})`,borderRadius:14,color:"#fff",fontSize:15 }}>Долучитись · ₴{deal.group*qty}</button>}
    </div>
  </div>;
}

// ── Мої покупки ─────────────────────────────────────────────────────────────
function MyDealsPage({ deals, joined, onOpen }) {
  const my=deals.filter(d=>joined[d.id]);
  return <div style={S.page}>
    <h2 style={{ color:T.text,fontSize:20,fontWeight:900,marginBottom:4 }}>Мої покупки</h2>
    <p style={{ color:T.textSec,fontSize:12,marginBottom:16 }}>{my.length} активних</p>
    {my.length===0?<div style={{ textAlign:"center",padding:60 }}><div style={{ fontSize:48 }}>🛒</div><div style={{ color:T.textMuted,marginTop:12,fontSize:13 }}>Ще нічого немає</div></div>:
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>{my.map(d=>{const p=pct(d);return <div key={d.id} onClick={()=>onOpen(d)} style={{ ...S.card,cursor:"pointer" }}>
      <div style={{ ...S.flex,gap:10,marginBottom:8 }}><Ic emoji={d.avatar} size={40}/><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:800,color:T.text }}>{d.title}</div><div style={{ fontSize:10,color:T.textSec }}>{d.seller}</div></div><div style={{ textAlign:"right" }}><div style={{ fontSize:16,fontWeight:900,color:T.green }}>₴{d.group}</div></div></div>
      <div style={{ ...S.flex,gap:10 }}><div style={{ flex:1 }}><ProgressBar value={p} color={pCol(p)}/></div><Badge>В групі</Badge></div>
    </div>;})}</div>}
  </div>;
}

// ── QR-код ──────────────────────────────────────────────────────────────────
function QRCode({ value, size=180 }) {
  const cells=25,cs=size/cells,hash=value.split("").reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0);
  const grid=Array.from({length:cells},(_,r)=>Array.from({length:cells},(_,c)=>{
    const inF=(cr,cc)=>cr>=0&&cr<7&&cc>=0&&cc<7;
    if(inF(r,c)||inF(r,c-(cells-7))||inF(r-(cells-7),c)){const fr=r<7?r:r-(cells-7),fc=c<7?c:c-(cells-7);if(fr===0||fr===6||fc===0||fc===6)return true;if(fr>=2&&fr<=4&&fc>=2&&fc<=4)return true;return false;}
    if(r===6)return c%2===0;if(c===6)return r%2===0;
    return(((hash^(r*37+c*53+r*c*7))>>>0)%100)>42;
  }));
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><rect width={size} height={size} fill="#fff" rx={4}/>
    {grid.map((row,r)=>row.map((on,c)=>on?<rect key={`${r}-${c}`} x={c*cs} y={r*cs} width={cs+.5} height={cs+.5} fill={T.text}/>:null))}
  </svg>;
}

function BuyerQRPage({ deal, qty, onBack }) {
  const [status,setStatus]=useState("active"),[copied,setCopied]=useState(false);
  const code=`SC-${(deal.id*1000+qty).toString(36).toUpperCase().padStart(6,"0")}`,total=deal.group*qty;
  return <div style={S.page}>
    <BackBtn onClick={onBack}/>
    <div style={{ ...S.card,textAlign:"center",padding:20 }}>
      <div style={{ ...S.flex,justifyContent:"center",gap:6,marginBottom:14 }}>
        <div style={{ width:8,height:8,borderRadius:"50%",background:status==="active"?T.accent:status==="scanned"?T.yellow:T.green,animation:status==="active"?"pulse 2s infinite":"none" }}/>
        <span style={{ fontSize:11,fontWeight:700,color:status==="active"?T.green:status==="scanned"?"#a16207":T.green }}>{status==="active"?"Активний":status==="scanned"?"Зіскановано":"Отримано"}</span>
      </div>
      <div style={{ background:T.cardAlt,borderRadius:T.radius,padding:14,display:"inline-block",marginBottom:14 }}><QRCode value={code+"|"+deal.title} size={180}/></div>
      <div style={{ ...S.flex,justifyContent:"center",gap:6,marginBottom:4 }}>
        <span style={{ fontSize:18,fontWeight:900,color:T.text,letterSpacing:2 }}>{code}</span>
        <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{ ...S.btn,background:"transparent",color:copied?T.green:T.textMuted,padding:2 }}>{copied?I.check:I.copy}</button>
      </div>
      <div style={{ fontSize:12,color:T.textSec,marginBottom:16 }}>{deal.title} × {qty} {deal.unit}</div>
      <div style={{ ...S.card,background:T.greenLight,marginBottom:14 }}><div style={{ fontSize:11,color:T.green }}>Сума</div><div style={{ fontSize:28,fontWeight:900,color:T.green }}>₴{total}</div></div>
      <div style={{ ...S.card,padding:10,marginBottom:10 }}>
        {[["Продавець",deal.seller],["Місто",deal.city],["Дійсний",deal.days+" дн."]].map(([k,v])=><div key={k} style={{ ...S.flex,justifyContent:"space-between",padding:"4px 0" }}><span style={{ fontSize:11,color:T.textSec }}>{k}</span><span style={{ fontSize:11,fontWeight:700,color:T.text }}>{v}</span></div>)}
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={()=>setStatus(status==="active"?"scanned":"done")} style={{ ...S.btn,flex:1,padding:11,borderRadius:10,fontSize:11,background:T.accent,color:"#fff" }}>{status==="active"?"Симуляція: скан":status==="scanned"?"Підтвердити":"Готово"}</button>
        <button onClick={()=>{const t=`${code}: ${deal.title} ₴${total}`;if(navigator.share)navigator.share({title:code,text:t});else navigator.clipboard.writeText(t);}} style={{ ...S.btn,padding:11,borderRadius:10,background:T.cardAlt,color:T.textSec }}>{I.share}</button>
      </div>
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
  </div>;
}

// ── QR Хаб ──────────────────────────────────────────────────────────────────
function QRHub() {
  const [scanning,setScanning]=useState(false),[scanned,setScanned]=useState(null);
  if(scanned) return <div style={S.page}><BackBtn onClick={()=>setScanned(null)}/>
    <div style={{ ...S.card,textAlign:"center",padding:20 }}>
      <div style={{ fontSize:44,marginBottom:10 }}>✅</div>
      <h3 style={{ color:T.text,fontSize:16,fontWeight:900,marginBottom:10 }}>Знайдено!</h3>
      <div style={{ ...S.card,background:T.greenLight,textAlign:"left",marginBottom:14 }}>
        {[["Покупець",scanned.buyer],["Товар",`${scanned.item} × ${scanned.qty} ${scanned.unit}`],["Сума",`₴${scanned.amount}`]].map(([k,v])=><div key={k} style={{ ...S.flex,justifyContent:"space-between",padding:"4px 0" }}><span style={{ fontSize:11,color:T.textSec }}>{k}</span><span style={{ fontSize:11,fontWeight:700,color:T.text }}>{v}</span></div>)}
      </div>
      <button onClick={()=>setScanned(null)} style={{ ...S.btn,width:"100%",padding:13,background:T.accent,borderRadius:12,color:"#fff",fontSize:13 }}>Підтвердити видачу</button>
    </div>
  </div>;

  if(scanning) return <div style={S.page}><BackBtn onClick={()=>setScanning(false)}/>
    <div style={{ ...S.card,textAlign:"center",padding:20 }}>
      <div style={{ width:"100%",height:220,background:T.text,borderRadius:T.radius,marginBottom:14,...S.flex,justifyContent:"center",position:"relative",overflow:"hidden" }}>
        <div style={{ width:160,height:160,border:`3px solid ${T.accent}`,borderRadius:14 }}/>
        <div style={{ position:"absolute",width:160,height:2,background:T.accent,animation:"scanLine 2s linear infinite" }}/>
      </div>
      <button onClick={()=>{setScanning(false);setScanned(ORDERS[0]);}} style={{ ...S.btn,width:"100%",padding:12,background:T.cardAlt,borderRadius:12,color:T.text,fontSize:12 }}>Симуляція: сканувати</button>
    </div>
    <style>{`@keyframes scanLine{0%{top:20%}50%{top:70%}100%{top:20%}}`}</style>
  </div>;

  return <div style={S.page}>
    <h2 style={{ color:T.text,fontSize:20,fontWeight:900,marginBottom:16 }}>QR-центр</h2>
    <div onClick={()=>setScanning(true)} style={{ ...S.card,...S.flex,gap:14,padding:18,cursor:"pointer",marginBottom:14 }}><Ic emoji="📷" size={48}/><div><div style={{ fontSize:14,fontWeight:800,color:T.text }}>Сканувати QR</div><div style={{ fontSize:11,color:T.textSec }}>Підтвердити видачу товару</div></div></div>
    <div style={{ fontSize:13,fontWeight:800,color:T.text,marginBottom:10 }}>Приклади</div>
    {ORDERS.slice(0,2).map(o=><div key={o.id} style={{ ...S.card,...S.flex,gap:10,marginBottom:8 }}>
      <QRCode value={o.id} size={50}/>
      <div style={{ flex:1 }}><div style={{ fontSize:12,fontWeight:700,color:T.text }}>{o.id}</div><div style={{ fontSize:10,color:T.textSec }}>{o.buyer}</div></div>
      <div style={{ textAlign:"right" }}><div style={{ fontSize:13,fontWeight:800,color:T.green }}>₴{o.amount}</div><Badge bg={o.status==="paid"?"#fef9c3":T.greenLight} color={o.status==="paid"?"#a16207":T.green}>{o.status==="paid"?"Оплачено":"Видано"}</Badge></div>
    </div>)}
  </div>;
}

// ── Дашборд продавця ────────────────────────────────────────────────────────
function SellerDashboard() {
  const active=ORDERS.filter(o=>o.status==="paid"),done=ORDERS.filter(o=>o.status==="done"),rev=ORDERS.reduce((s,o)=>s+o.amount,0);
  return <div style={S.page}>
    <div style={{ background:`linear-gradient(135deg,${T.greenLight},${T.greenBorder})`,borderRadius:T.radius,padding:18,marginBottom:16 }}>
      <div style={{ ...S.flex,gap:10,marginBottom:14 }}><Ic emoji={SELLER.avatar} size={44}/><div><div style={{ fontSize:16,fontWeight:900,color:T.text }}>{SELLER.name}</div><div style={{ ...S.flex,gap:4,fontSize:10,color:T.green }}>{I.pin} {SELLER.city} {I.star} {SELLER.rating}</div></div></div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6 }}>
        {[[`₴${rev}`,"Дохід"],[`${active.length}`,"Активні"],[`${done.length}`,"Завершені"]].map(([v,l],i)=>
          <div key={i} style={{ background:"rgba(255,255,255,.7)",borderRadius:T.radiusSm,padding:10,textAlign:"center" }}><div style={{ fontSize:16,fontWeight:900,color:T.green }}>{v}</div><div style={{ fontSize:9,color:T.textSec }}>{l}</div></div>
        )}
      </div>
    </div>
    <h3 style={{ color:T.text,fontSize:14,fontWeight:800,marginBottom:10 }}>Активні</h3>
    {active.map(o=><div key={o.id} style={{ ...S.card,...S.flex,gap:10,marginBottom:8 }}><Ic emoji={o.avatar} size={40}/><div style={{ flex:1 }}><div style={{ fontSize:12,fontWeight:700,color:T.text }}>{o.buyer}</div><div style={{ fontSize:10,color:T.textSec }}>{o.item} × {o.qty} {o.unit}</div></div><div style={{ textAlign:"right" }}><div style={{ fontSize:14,fontWeight:800,color:T.green }}>₴{o.amount}</div><Badge bg="#fef9c3" color="#a16207">Оплачено</Badge></div></div>)}
    {done.length>0&&<><h3 style={{ color:T.text,fontSize:14,fontWeight:800,margin:"14px 0 10px" }}>Завершені</h3>
    {done.map(o=><div key={o.id} style={{ ...S.card,...S.flex,gap:10,marginBottom:8,opacity:.6 }}><Ic emoji={o.avatar} size={32}/><div style={{ flex:1 }}><div style={{ fontSize:12,fontWeight:700,color:T.text }}>{o.buyer}</div><div style={{ fontSize:10,color:T.textSec }}>{o.item}</div></div><Badge>Видано</Badge></div>)}</>}
  </div>;
}

// ── Гаманець + Профіль ──────────────────────────────────────────────────────
function WalletPage({ user, setUser }) {
  const [editing,setEditing]=useState(false),[eName,setEName]=useState(user?.name||""),[eEmail,setEEmail]=useState(user?.email||""),[ePhone,setEPhone]=useState(user?.phone||""),[eCity,setECity]=useState(user?.city||"");
  const txIcons={income:"↓",withdrawal:"↑",hold:"◷"}, txColors={income:T.green,withdrawal:T.orange,hold:T.yellow};
  const initials=(user?.name||"Г").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return <div style={S.page}>
    <div style={{ ...S.card,marginBottom:16,textAlign:"center",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:80,background:`linear-gradient(135deg,${T.accent},${T.purple},${T.blue})` }}/>
      <div style={{ position:"relative",paddingTop:40 }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${T.greenLight},#e0e7ff)`,border:"3px solid #fff",margin:"0 auto 10px",...S.flex,justifyContent:"center",fontSize:24,fontWeight:900,color:T.green,boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          {initials}
        </div>
        <div style={{ fontSize:18,fontWeight:900,color:T.text }}>{user?.name||"Гість"}</div>
        <div style={{ fontSize:11,color:T.textSec,marginTop:2 }}>{user?.email||"Не вказано"}</div>
        <button onClick={()=>setEditing(!editing)} style={{ ...S.btn,...S.flex,gap:4,justifyContent:"center",margin:"10px auto 0",padding:"6px 14px",borderRadius:10,background:T.cardAlt,color:T.textSec,fontSize:11 }}>{I.edit} {editing?"Закрити":"Редагувати"}</button>
      </div>
      {editing&&<div style={{ textAlign:"left",marginTop:14,display:"flex",flexDirection:"column",gap:10 }}>
        <Input value={eName} onChange={e=>setEName(e.target.value)} placeholder="Ім'я" icon={I.user}/>
        <Input value={eEmail} onChange={e=>setEEmail(e.target.value)} placeholder="Email" icon={I.mail}/>
        <Input value={ePhone} onChange={e=>setEPhone(e.target.value)} placeholder="Телефон" icon={I.phone}/>
        <Input value={eCity} onChange={e=>setECity(e.target.value)} placeholder="Місто" icon={I.pin}/>
        <button onClick={()=>{const u={...user,name:eName,email:eEmail,phone:ePhone,city:eCity};localStorage.setItem("spilnokup_user",JSON.stringify(u));setUser(u);setEditing(false);}}
          style={{ ...S.btn,width:"100%",padding:12,background:T.accent,color:"#fff",borderRadius:12,fontSize:13 }}>Зберегти</button>
      </div>}
    </div>

    <div style={{ ...S.card,background:`linear-gradient(135deg,${T.greenLight},${T.greenBorder})`,marginBottom:16,textAlign:"center",padding:20 }}>
      <div style={{ fontSize:11,color:T.green }}>Баланс</div>
      <div style={{ fontSize:32,fontWeight:900,color:T.text }}>₴12 840</div>
      <div style={{ fontSize:11,color:T.textSec,marginTop:2 }}>Доступно: ₴9 640</div>
      <button style={{ ...S.btn,background:T.accent,color:"#fff",borderRadius:12,padding:"10px 20px",fontSize:13,marginTop:12 }}>Вивести</button>
    </div>

    <h3 style={{ color:T.text,fontSize:14,fontWeight:800,marginBottom:10 }}>Транзакції</h3>
    {TRANSACTIONS.map(t=><div key={t.id} style={{ ...S.card,...S.flex,gap:10,marginBottom:8 }}>
      <div style={{ width:36,height:36,borderRadius:10,background:txColors[t.type]+"18",...S.flex,justifyContent:"center",fontSize:16,fontWeight:900,color:txColors[t.type] }}>{txIcons[t.type]}</div>
      <div style={{ flex:1 }}><div style={{ fontSize:12,fontWeight:700,color:T.text }}>{t.desc}</div><div style={{ fontSize:10,color:T.textSec }}>{t.date}</div></div>
      <div style={{ fontSize:14,fontWeight:800,color:txColors[t.type] }}>{t.type==="income"?"+":t.type==="withdrawal"?"−":""}₴{t.amount}</div>
    </div>)}

    <div style={{ ...S.card,marginTop:14 }}>
      <h3 style={{ color:T.text,fontSize:14,fontWeight:800,marginBottom:10 }}>ФОП</h3>
      {[["Назва",SELLER.fop],["ІПН",SELLER.ipn],["IBAN",SELLER.iban],["Банк",SELLER.bank]].map(([k,v])=>
        <div key={k} style={{ ...S.flex,justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}22` }}><span style={{ fontSize:11,color:T.textSec }}>{k}</span><span style={{ fontSize:11,fontWeight:700,color:T.text,textAlign:"right",maxWidth:"60%",wordBreak:"break-all" }}>{v}</span></div>
      )}
    </div>
  </div>;
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("spilnokup_user"));}catch{return null;}});
  const [authStep,setAuthStep]=useState(user?null:"welcome");
  const [tab,setTab]=useState("market"),[page,setPage]=useState(null),[joined,setJoined]=useState({}),[buyData,setBuyData]=useState(null);
  const [deals,setDeals]=useState(INIT_DEALS);

  const onJoin=id=>setJoined(j=>({...j,[id]:!j[id]}));
  const onOpen=deal=>{setPage("detail");setBuyData({deal,qty:deal.min});};
  const onBuy=(deal,qty)=>{setBuyData({deal,qty});setPage("qr");};
  const onRegDone=data=>{localStorage.setItem("spilnokup_user",JSON.stringify(data));setUser(data);setAuthStep(null);};
  const onGuest=()=>{const g={name:"Гість",email:"",phone:"",city:""};localStorage.setItem("spilnokup_user",JSON.stringify(g));setUser(g);setAuthStep(null);};

  const showNav=!page&&!authStep;
  const isMobile=typeof window!=="undefined"&&window.innerWidth<=500;

  function render() {
    if(authStep==="welcome") return <WelcomeScreen onStart={()=>setAuthStep("register")} onGuest={onGuest}/>;
    if(authStep==="register") return <RegisterScreen onDone={onRegDone}/>;
    if(page==="detail"&&buyData) return <DealDetail deal={buyData.deal} onBack={()=>setPage(null)} joined={joined} onJoin={onJoin} onBuy={onBuy}/>;
    if(page==="qr"&&buyData) return <BuyerQRPage deal={buyData.deal} qty={buyData.qty} onBack={()=>setPage(null)}/>;
    if(page==="createDeal") return <CreateDealPage onBack={()=>setPage(null)} onSave={d=>{setDeals(prev=>[d,...prev]);setPage(null);}}/>;
    switch(tab){
      case"market":return <MarketPage deals={deals} joined={joined} onJoin={onJoin} onOpen={onOpen} user={user} onCreateDeal={()=>setPage("createDeal")}/>;
      case"my":return <MyDealsPage deals={deals} joined={joined} onOpen={onOpen}/>;
      case"qr":return <QRHub/>;
      case"seller":return <SellerDashboard/>;
      case"wallet":return <WalletPage user={user} setUser={setUser}/>;
      default:return null;
    }
  }

  return <div style={{ minHeight:"100vh",background:T.bg,display:"flex",justifyContent:"center",alignItems:isMobile?"stretch":"flex-start",padding:isMobile?0:"20px 0",fontFamily:"'Inter',system-ui,sans-serif" }}>
    <div style={{ width:isMobile?"100%":390,height:isMobile?"100vh":820,background:T.card,borderRadius:isMobile?0:44,overflow:"hidden",boxShadow:isMobile?"none":"0 20px 60px rgba(0,0,0,0.08)",position:"relative" }}>
      <BgDecor/>
      <div style={{ position:"relative",zIndex:1,height:showNav?"calc(100% - 72px)":"100%",overflowY:"auto" }}>{render()}</div>
      {showNav&&<Nav tab={tab} setTab={setTab}/>}
    </div>
  </div>;
}
