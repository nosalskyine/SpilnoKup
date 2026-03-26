import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDeals as apiFetchDeals, sendOtp, verifyOtp, logout as apiLogout, createOrder, createDeal, deleteDeal, fetchMyOrders, fetchSellerOrders, fetchSellerDeals, fetchWallet, generateQR, verifyQR, fetchConversations, createConversation, fetchMessages, sendMessageApi, isLoggedIn, API } from "./api";
import { connectSocket, disconnectSocket, reconnectWithAuth, onEvent, joinDeal, joinConversation } from "./socket";
import jsQR from "jsqr";
import QRCodeLib from "qrcode";

// ── Теми ────────────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    name: "Світла", emoji: "☀️",
    bg:"#f5f5f5",card:"#ffffff",cardAlt:"#eef0f4",border:"#d0d5dd",
    text:"#1a1a2e",textSec:"#6b7280",textMuted:"#9ca3af",
    accent:"#3d8c5c",green:"#2e7d4f",greenLight:"#e6f4ec",greenBorder:"#b8dcc8",
    orange:"#c46a20",yellow:"#b8960a",purple:"#6b5fa8",blue:"#4a78b0",
    navBg:"rgba(255,255,255,0.85)",navText:"#6b7280",
    gradA:"#3d8c5c",gradB:"#b8960a",gradC:"#c46a20",
  },
  cream: {
    name: "Кремова", emoji: "🍦",
    bg:"#faf8f2",card:"#ffffff",cardAlt:"#f0ece2",border:"#d6ceb8",
    text:"#2c2416",textSec:"#8a7e6a",textMuted:"#b0a690",
    accent:"#8b6e3e",green:"#5a7a4a",greenLight:"#f0f4e8",greenBorder:"#c8d4b0",
    orange:"#c46a20",yellow:"#b8960a",purple:"#7a6890",blue:"#5a7090",
    navBg:"rgba(250,248,242,0.85)",navText:"#8a7e6a",
    gradA:"#8b6e3e",gradB:"#b8960a",gradC:"#5a7a4a",
  },
  dark: {
    name: "Графіт", emoji: "🌑",
    bg:"#111116",card:"#1a1a22",cardAlt:"#22222c",border:"#b8960a",
    text:"#d4d4d8",textSec:"#85858f",textMuted:"#555560",
    accent:"#3d8c5c",green:"#5a9e74",greenLight:"#141f18",greenBorder:"#243328",
    orange:"#c46a20",yellow:"#b8960a",purple:"#7a72a8",blue:"#5878a0",
    navBg:"rgba(17,17,22,0.50)",navText:"#b0b0b8",
    gradA:"#3d8c5c",gradB:"#b8960a",gradC:"#c46a20",
  },
  ocean: {
    name: "Океан", emoji: "🌊",
    bg:"#0e1320",card:"#151c2c",cardAlt:"#1c2438",border:"#b8960a",
    text:"#c8cdd6",textSec:"#7888a0",textMuted:"#4a5568",
    accent:"#3068b8",green:"#3a8fb0",greenLight:"#101c2c",greenBorder:"#1a3050",
    orange:"#c46a20",yellow:"#b8960a",purple:"#6870a8",blue:"#5078a0",
    navBg:"rgba(14,19,32,0.50)",navText:"#a0a8b8",
    gradA:"#3068b8",gradB:"#6870a8",gradC:"#2a7888",
  },
  berry: {
    name: "Слива", emoji: "🫐",
    bg:"#14101a",card:"#1c1624",cardAlt:"#261e30",border:"#b8960a",
    text:"#d0c8d4",textSec:"#8878a0",textMuted:"#5a4870",
    accent:"#9050b0",green:"#a068c0",greenLight:"#1a1224",greenBorder:"#2e1e40",
    orange:"#c46a20",yellow:"#b8960a",purple:"#8870a8",blue:"#7060a0",
    navBg:"rgba(20,16,26,0.50)",navText:"#b0a8b8",
    gradA:"#9050b0",gradB:"#8870a8",gradC:"#a04878",
  },
};

let T = { ...THEMES.ocean, radius:16, radiusSm:12 };
function applyTheme(id) { Object.assign(T, THEMES[id], { radius:16, radiusSm:12 }); }

function getS() {
  return {
    card: { background:T.card,borderRadius:T.radius,padding:14,border:`1px solid ${T.border}44` },
    btn: { border:"none",cursor:"pointer",fontWeight:700,fontFamily:"inherit" },
    flex: { display:"flex",alignItems:"center" },
    page: { padding:"16px 16px 90px" },
  };
}
let S = getS();

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
  star: <svg width="12" height="12" fill="currentColor" stroke="none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  pin: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  down: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  msg: <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  img: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
};

// ── Фото-заглушки (кольорові SVG плашки) ────────────────────────────────────
const PHOTOS = {
  chicken: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill="#2a1f0a"/><text x="40" y="28" textAnchor="middle" fontSize="20">🐔</text><text x="40" y="46" textAnchor="middle" fontSize="7" fill="#a89060">Курчата бройлер</text></svg>,
  honey: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill="#2a200a"/><text x="40" y="28" textAnchor="middle" fontSize="20">🍯</text><text x="40" y="46" textAnchor="middle" fontSize="7" fill="#b89830">Акацієвий мед</text></svg>,
  bread: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill="#1a1510"/><text x="40" y="28" textAnchor="middle" fontSize="20">🥐</text><text x="40" y="46" textAnchor="middle" fontSize="7" fill="#a08860">Домашня випічка</text></svg>,
  potato: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill="#1a1a0a"/><text x="40" y="28" textAnchor="middle" fontSize="20">🥔</text><text x="40" y="46" textAnchor="middle" fontSize="7" fill="#8a9050">Молода картопля</text></svg>,
  cheese: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill="#1a180a"/><text x="40" y="28" textAnchor="middle" fontSize="20">🧀</text><text x="40" y="46" textAnchor="middle" fontSize="7" fill="#b89830">Крафтові сири</text></svg>,
  fish: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill="#0a1520"/><text x="40" y="28" textAnchor="middle" fontSize="20">🐟</text><text x="40" y="46" textAnchor="middle" fontSize="7" fill="#5088a0">Свіжа форель</text></svg>,
  generic: (w=80,h=60)=><svg width={w} height={h} viewBox="0 0 80 60"><rect width="80" height="60" rx="8" fill={T.cardAlt}/><text x="40" y="34" textAnchor="middle" fontSize="9" fill={T.textMuted}>Фото</text></svg>,
};
const dealPhoto=(d)=>{
  if(d.photo) return d.photo;
  const map={1:"chicken",2:"honey",3:"bread",4:"potato",8:"chicken",10:"cheese",12:"fish"};
  return map[d.id]||null;
};

// ── Дані ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"all", label:"Всі", icon:"🏪" },
  { id:"food", label:"Їжа", icon:"🍽" },
  { id:"farm", label:"Ферма", icon:"🐔" },
  { id:"veggies", label:"Городина", icon:"🥬" },
  { id:"dairy", label:"Молочне", icon:"🥛" },
  { id:"bakery", label:"Випічка", icon:"🍞" },
  { id:"drinks", label:"Напої", icon:"☕" },
  { id:"sport", label:"Спорт", icon:"⚽" },
  { id:"electronics", label:"Електроніка", icon:"📱" },
  { id:"services", label:"Послуги", icon:"🛠" },
  { id:"clothing", label:"Одяг", icon:"👕" },
  { id:"handmade", label:"Handmade", icon:"🧵" },
  { id:"beauty", label:"Краса", icon:"💄" },
  { id:"home", label:"Дім", icon:"🏠" },
  { id:"other", label:"Інше", icon:"📦" },
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

const SELLER = { fop:"—",ipn:"—",iban:"—",bank:"—" };
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
const discBorder = d => { const dd=disc(d); return dd>30?"#ef4444":dd>=20?"#22c55e":"#1a1a2e"; };

// ── Декоративний фон ────────────────────────────────────────────────────────
function BgDecor() {
  return <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden",pointerEvents:"none",zIndex:0 }}>
    <div style={{ position:"absolute",top:-40,right:-30,width:260,height:260,borderRadius:"50%",background:`radial-gradient(circle,${T.gradA}0e,transparent 70%)` }}/>
    <div style={{ position:"absolute",top:"35%",left:-50,width:240,height:240,borderRadius:"50%",background:`radial-gradient(circle,${T.gradB}0c,transparent 70%)` }}/>
    <div style={{ position:"absolute",bottom:80,right:-20,width:220,height:220,borderRadius:"50%",background:`radial-gradient(circle,${T.gradC}0a,transparent 70%)` }}/>
    <svg style={{ position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.08 }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={T.gradA}/><stop offset="50%" stopColor={T.gradB}/><stop offset="100%" stopColor={T.gradC}/></linearGradient>
        <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.gradC}/><stop offset="50%" stopColor={T.gradA}/><stop offset="100%" stopColor={T.gradB}/></linearGradient>
      </defs>
      <path d="M-20 120Q60 60 150 140T300 80Q350 60 420 130" fill="none" stroke="url(#g1)" strokeWidth="2.5" opacity="0.7"/>
      <path d="M420 220Q340 180 250 260T100 200Q40 170 -20 240" fill="none" stroke="url(#g2)" strokeWidth="2" opacity="0.5"/>
      <path d="M-20 350Q80 290 170 370T320 310Q380 280 420 360" fill="none" stroke="url(#g1)" strokeWidth="3" opacity="0.6"/>
      <path d="M420 460Q330 420 240 500T90 440Q20 410 -20 480" fill="none" stroke="url(#g2)" strokeWidth="2" opacity="0.4"/>
      <path d="M-20 560Q100 500 200 580T360 520Q400 500 420 570" fill="none" stroke="url(#g1)" strokeWidth="2.5" opacity="0.55"/>
      <path d="M420 660Q300 620 200 700T50 640Q-10 620 -20 680" fill="none" stroke="url(#g2)" strokeWidth="1.5" opacity="0.45"/>
      <path d="M60 50Q120 20 200 70T340 30" fill="none" stroke="url(#g1)" strokeWidth="1.5" opacity="0.35"/>
      <path d="M350 150Q280 130 200 170T80 140" fill="none" stroke="url(#g2)" strokeWidth="1" opacity="0.3"/>
    </svg>
  </div>;
}

function ThemeSwitcher({ current, onChange }) {
  return <div style={{ ...S.flex,gap:6 }}>
    {Object.entries(THEMES).map(([id,t])=>(
      <button key={id} onClick={()=>onChange(id)} style={{ ...S.btn,padding:"5px 10px",borderRadius:10,fontSize:10,background:current===id?T.accent:T.cardAlt,color:current===id?"#fff":T.textSec,...S.flex,gap:4 }}>
        {t.emoji} {t.name}
      </button>
    ))}
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
  return <div style={{ fontSize:size*0.5,width:size,height:size,background:T.cardAlt,borderRadius:size>40?T.radius:8,...S.flex,justifyContent:"center",border:`1px solid ${T.border}22` }}>{emoji}</div>;
}
function Input({ value, onChange, placeholder, icon, type="text", area }) {
  const common = { width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:icon?"12px 16px 12px 42px":"12px 16px",color:T.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit",WebkitAppearance:"none",position:"relative",zIndex:1 };
  return <div style={{ position:"relative" }}>
    {icon&&<div style={{ position:"absolute",left:14,top:area?14:"50%",transform:area?"none":"translateY(-50%)",color:T.textMuted,zIndex:2,pointerEvents:"none" }}>{icon}</div>}
    {area ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} style={{ ...common,resize:"vertical" }}/> :
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete="off" style={common}/>}
  </div>;
}

// ── Навігація (напівпрозора + анімація) ─────────────────────────────────────
const NAV = [["market",I.home,"Маркет"],["qr",I.qr,"QR"],["chat",I.msg,"Чат"],["seller",I.chart,"Бізнес"],["wallet",I.wallet,"Гаманець"]];

function Nav({ tab, setTab }) {
  const isCenter=(t)=>t==="chat";
  const logged=isLoggedIn();
  const guestTabs=["market","wallet"];
  return <div style={{ position:"absolute",bottom:0,left:0,right:0,height:68,background:T.navBg,backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",borderTop:`1px solid ${T.border}22`,...S.flex,zIndex:100,padding:"0 4px" }}>
    {NAV.filter(([t])=>logged||guestTabs.includes(t)).map(([t,icon,label])=>(
      <button key={t} onClick={()=>setTab(t)} style={{ ...S.btn,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:isCenter(t)?2:3,background:"transparent",color:tab===t?T.accent:T.navText,transition:"all .25s",transform:tab===t?"scale(1.15)":"scale(1)",marginTop:isCenter(t)?-8:0 }}>
        <div style={{ opacity:tab===t?1:0.45,transform:isCenter(t)?"scale(1.2)":"scale(1)" }}>{icon}</div>
        <span style={{ fontSize:isCenter(t)?10:9,fontWeight:tab===t?800:500,opacity:tab===t?1:0.45 }}>{label}</span>
        {tab===t&&<div style={{ width:20,height:3,background:`linear-gradient(90deg,${T.gradA},${T.gradB})`,borderRadius:2,marginTop:-1 }}/>}
      </button>
    ))}
  </div>;
}

// ── Welcome + Реєстрація ────────────────────────────────────────────────────
function WelcomeScreen({ onStart, onGuest }) {
  return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:24,textAlign:"center" }}>
    <div style={{ fontSize:56,marginBottom:12 }}>🛒</div>
    <h1 style={{ fontSize:28,fontWeight:900,color:T.text,marginBottom:6 }}>Spil</h1>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:28,lineHeight:1.6 }}>Спільні покупки від малого бізнесу України.<br/>Економте до 40% купуючи разом!</p>
    <button onClick={onStart} style={{ ...S.btn,width:"100%",padding:15,background:"#0088cc",color:"#fff",borderRadius:14,fontSize:15,marginBottom:10 }}>Увійти через Telegram</button>
    <button onClick={onGuest} style={{ ...S.btn,width:"100%",padding:14,background:T.cardAlt,color:T.textSec,borderRadius:14,fontSize:13 }}>Увійти як гість</button>
    <div style={{ marginTop:28,background:T.cardAlt,borderRadius:T.radius,padding:14,textAlign:"left" }}>
      <div style={{ ...S.flex,gap:6,fontSize:12,fontWeight:700,color:T.text,marginBottom:6 }}>{I.down} Додати на екран:</div>
      <div style={{ fontSize:11,color:T.textSec,lineHeight:1.8 }}><b>Android:</b> Chrome → ⋮ → «На головний екран»<br/><b>iPhone:</b> Safari → ⬆ → «На Початковий екран»</div>
    </div>
  </div>;
}

function RegisterScreen({ onDone }) {
  const [step,setStep]=useState(0),[name,setName]=useState(""),[phone,setPhone]=useState(""),[city,setCity]=useState(""),[code,setCode]=useState("");
  const [telegramToken,setTelegramToken]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");

  const doSendOtp=async()=>{
    setLoading(true);setError("");
    try{
      const res=await sendOtp(phone);
      if(res.telegramToken) setTelegramToken(res.telegramToken);
      setStep(2);
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  const tgLink=telegramToken?`https://t.me/spilnokupbot?start=${telegramToken}`:"https://t.me/spilnokupbot";

  const doVerify=async()=>{
    setLoading(true);setError("");
    try{
      const data=await verifyOtp(phone,code,name,city,"register");
      onDone(data.user);
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  // Step 1: Name, phone, city
  if(step===0) return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",padding:24 }}>
    <BackBtn onClick={()=>{}}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Вхід / Реєстрація</h2>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20 }}>Крок 1 з 3</p>
    <div style={{ display:"flex",flexDirection:"column",gap:12,flex:1 }}>
      <Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+380..." icon={I.phone} type="tel"/>
      <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Ваше ім'я" icon={I.user}/>
      <Input value={city} onChange={e=>setCity(e.target.value)} placeholder="Місто"/>
      <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:4 }}>
        {["Київ","Харків","Одеса","Дніпро","Львів","Бориспіль","Бровари","Черкаси","Полтава"].map(c=>
          <button key={c} onClick={()=>setCity(c)} style={{ ...S.btn,padding:"7px 12px",borderRadius:10,fontSize:11,background:city===c?T.accent:T.cardAlt,color:city===c?"#fff":T.textSec }}>{c}</button>
        )}
      </div>
    </div>
    {error&&<div style={{ color:"#ef4444",fontSize:12,marginTop:8 }}>{error}</div>}
    <button onClick={doSendOtp} disabled={!name||!phone||!city||loading} style={{ ...S.btn,width:"100%",padding:15,background:(name&&phone&&city)?T.accent:T.cardAlt,color:(name&&phone&&city)?"#fff":T.textMuted,borderRadius:14,fontSize:15,marginTop:20 }}>{loading?"Зачекайте...":"Далі"}</button>
  </div>;

  // Step 2: Open Telegram
  if(step===2) return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",padding:24,textAlign:"center" }}>
    <BackBtn onClick={()=>setStep(0)}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Отримайте код</h2>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20 }}>Крок 2 з 3</p>
    <div style={{ fontSize:60,margin:"20px 0" }}>✈️</div>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20,lineHeight:1.6 }}>Натисніть кнопку нижче — відкриється Telegram.<br/>Натисніть <b>Start</b> — бот надішле код.</p>
    <a href={tgLink} target="_blank" rel="noopener noreferrer" style={{ ...S.btn,display:"block",width:"100%",padding:15,background:"#0088cc",color:"#fff",borderRadius:14,fontSize:15,marginBottom:14,textAlign:"center",textDecoration:"none",boxSizing:"border-box" }}>✈ Відкрити Telegram</a>
    <div style={{ fontSize:11,color:T.textMuted,lineHeight:1.6,marginBottom:20 }}>1. Натисніть Start в боті<br/>2. Бот надішле 6-значний код<br/>3. Введіть код на наступному кроці</div>
    {error&&<div style={{ color:"#ef4444",fontSize:12,marginBottom:8 }}>{error}</div>}
    <button onClick={()=>setStep(3)} style={{ ...S.btn,width:"100%",padding:15,background:T.accent,color:"#fff",borderRadius:14,fontSize:15 }}>Я отримав код</button>
  </div>;

  // Step 3: Enter code
  return <div style={{ minHeight:"100%",display:"flex",flexDirection:"column",padding:24 }}>
    <BackBtn onClick={()=>setStep(2)}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Введіть код</h2>
    <p style={{ fontSize:13,color:T.textSec,marginBottom:20 }}>Крок 3 з 3</p>
    <div style={{ ...S.card,background:T.greenLight,textAlign:"center",marginBottom:16,...S.flex,justifyContent:"center",gap:6 }}>
      <span style={{ fontSize:16 }}>✈️</span>
      <span style={{ fontSize:12,color:T.green }}>Код надіслано в Telegram</span>
    </div>
    <div style={{ ...S.flex,justifyContent:"center",gap:10,marginBottom:20 }}>
      {[0,1,2,3,4,5].map(i=><input key={i} maxLength={1} inputMode="numeric" pattern="[0-9]*" value={code[i]||""} onChange={e=>{const v=e.target.value.replace(/\D/g,"");const nc=code.split("");nc[i]=v;setCode(nc.join(""));if(v&&i<5)e.target.nextSibling?.focus();}} onKeyDown={e=>{if(e.key==="Backspace"&&!code[i]&&i>0){const nc=code.split("");nc[i-1]="";setCode(nc.join(""));e.target.previousSibling?.focus();}}}
        style={{ width:46,height:54,textAlign:"center",fontSize:24,fontWeight:900,border:`2px solid ${code[i]?T.accent:T.border}`,borderRadius:12,outline:"none",color:T.text,fontFamily:"inherit",background:T.card }}/>)}
    </div>
    {error&&<div style={{ color:"#ef4444",fontSize:12,marginBottom:8,textAlign:"center" }}>{error}</div>}
    <button onClick={doVerify} disabled={code.length<6||loading}
      style={{ ...S.btn,width:"100%",padding:15,background:code.length>=6?T.accent:T.cardAlt,color:code.length>=6?"#fff":T.textMuted,borderRadius:14,fontSize:15 }}>{loading?"Перевіряємо...":"Підтвердити"}</button>
  </div>;
}

// ── Картка угоди ────────────────────────────────────────────────────────────
function DealPhoto({ deal, h=90 }) {
  // Real photo from DB
  if(deal.photo && typeof deal.photo==="string" && deal.photo.startsWith("data:")) return <div style={{width:"100%",height:h,borderRadius:8,overflow:"hidden"}}><img src={deal.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>;
  // Fallback gradient
  const cats={farm:["#1a2010","#2a3518"],food:["#201510","#302518"],veggies:["#102010","#1a3018"],dairy:["#1a1a20","#2a2a30"],bakery:["#201510","#302518"],drinks:["#1a1510","#2a2018"],sport:["#0a1520","#1a2530"],electronics:["#101520","#1a2530"],services:["#151018","#251828"],clothing:["#1a1020","#2a1a30"],handmade:["#1a1020","#2a1a30"],beauty:["#1a0a18","#2a1a28"],home:["#141410","#242418"],other:["#1a1a20","#2a2a30"]};
  const c=cats[deal.cat]||["#1a1a20","#2a2a30"];
  return <div style={{width:"100%",height:h,borderRadius:8,background:`linear-gradient(135deg,${c[0]},${c[1]})`,...getS().flex,justifyContent:"center",flexDirection:"column",gap:4}}>
    <span style={{fontSize:28}}>{CATEGORIES.find(ct=>ct.id===deal.cat)?.icon||"📦"}</span>
    <span style={{fontSize:8,color:T.textMuted,fontWeight:600}}>{deal.title?.length>20?deal.title.slice(0,20)+"...":deal.title}</span>
  </div>;
}

function DealCard({ deal, onOpen, joined, onJoin, onRefresh }) {
  const p=pct(deal),d=disc(deal),isIn=joined[deal.id],col=pCol(p);
  const bc=discBorder(deal);
  return <div onClick={()=>onOpen(deal)} style={{ ...S.card,borderRadius:10,overflow:"hidden",cursor:"pointer",padding:0,border:`1px solid ${bc}44` }}>
    <div style={{...S.flex,gap:0}}>
      <div style={{width:72,flexShrink:0,padding:"6px 0 6px 6px"}}><DealPhoto deal={deal} h={62}/></div>
      <div style={{flex:1,padding:"6px 8px",minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:T.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{deal.title}</div>
        <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{deal.seller} · {deal.city}</div>
        <div style={{...S.flex,gap:4,marginTop:4}}>
          <div style={{flex:1}}><ProgressBar value={p} color={col} h={2}/></div>
          <span style={{fontSize:7,color:T.textMuted}}>{deal.joined}/{deal.needed}</span>
          <span style={{fontSize:7,color:T.textMuted}}>{deal.days}д</span>
          {isLoggedIn()&&!isIn&&<button onClick={async e=>{e.stopPropagation();
            try{await createOrder(deal.dbId||deal.id,deal.min);onJoin(deal.id);if(onRefresh)onRefresh();}catch(ex){alert(ex.message);}
          }} style={{...S.btn,background:T.accent,color:"#fff",borderRadius:4,padding:"1px 6px",fontSize:8}}>+</button>}
          {isIn&&<span style={{background:T.green,color:"#fff",borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700}}>✓</span>}
        </div>
      </div>
      <div style={{flexShrink:0,padding:"6px 8px 6px 0",textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"center",gap:3}}>
        <div style={{fontSize:16,fontWeight:800,color:T.green}}>₴{deal.group}</div>
        <div style={{fontSize:10,color:T.textMuted,textDecoration:"line-through"}}>₴{deal.retail}</div>
        <div style={{...S.flex,gap:3}}>
          {deal.hot&&<span style={{fontSize:8,fontWeight:800,color:T.orange,background:T.orange+"18",padding:"2px 5px",borderRadius:3}}>HOT</span>}
          <span style={{fontSize:8,fontWeight:800,color:bc,background:bc+"18",padding:"2px 5px",borderRadius:3}}>-{d}%</span>
        </div>
      </div>
    </div>
  </div>;
}

// ── Маркет ──────────────────────────────────────────────────────────────────
// ── Анімована інструкція ─────────────────────────────────────────────────────
function HowItWorks() {
  const [frame,setFrame]=useState(0);
  const bg0=`linear-gradient(135deg,${T.greenLight},${T.greenBorder})`;
  const scenes=[
    {title:"Обирай товар",desc:"Переглядай пропозиції від фермерів та малого бізнесу",icon:"🛒",elements:<>
      <div style={{...getS().flex,gap:6,marginTop:8}}>{["🌾","🍯","🥬","🧀"].map((e,i)=><div key={i} style={{width:32,height:32,borderRadius:8,background:T.card,...getS().flex,justifyContent:"center",fontSize:16,animation:`float ${1+i*0.3}s ease-in-out infinite alternate`}}>{e}</div>)}</div>
    </>},
    {title:"Долучайся до групи",desc:"Чим більше людей — тим нижча ціна для кожного",icon:"👥",elements:<>
      <div style={{position:"relative",height:32,marginTop:8}}>
        <div style={{height:8,background:T.cardAlt,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:"72%",background:T.accent,borderRadius:4,animation:"grow 3s ease-in-out infinite"}}/></div>
        <div style={{...getS().flex,justifyContent:"space-around",marginTop:4}}>{["👩","👨","👩‍🦰","👴","👧"].map((e,i)=><span key={i} style={{fontSize:14,animation:`pop ${0.5+i*0.2}s ease-out`}}>{e}</span>)}</div>
      </div>
    </>},
    {title:"Оплачуй вигідно",desc:"Економія до 40% порівняно з роздрібною ціною",icon:"💰",elements:<>
      <div style={{...getS().flex,justifyContent:"center",gap:8,marginTop:8}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:14,color:"#c46a20",textDecoration:"line-through"}}>₴380</div><div style={{fontSize:8,color:T.textSec}}>роздріб</div></div>
        <div style={{fontSize:18,color:T.textMuted}}>→</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:T.green}}>₴260</div><div style={{fontSize:8,color:T.green}}>в групі</div></div>
        <div style={{background:T.greenLight,border:`1px solid ${T.greenBorder}`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,color:T.green}}>-32%</div>
      </div>
    </>},
    {title:"Забирай з QR",desc:"Покажи QR-код продавцю та забери свій товар",icon:"📱",elements:<>
      <div style={{...getS().flex,justifyContent:"center",gap:12,marginTop:8}}>
        <div style={{width:40,height:40,background:T.card,borderRadius:8,...getS().flex,justifyContent:"center"}}>
          <svg width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" fill={T.cardAlt} rx="2"/><rect x="2" y="2" width="8" height="8" fill={T.text}/><rect x="18" y="2" width="8" height="8" fill={T.text}/><rect x="2" y="18" width="8" height="8" fill={T.text}/><rect x="12" y="12" width="4" height="4" fill={T.text}/></svg>
        </div>
        <div style={{fontSize:20,color:T.textMuted}}>→</div>
        <div style={{fontSize:28}}>📦</div>
        <div style={{fontSize:20,color:T.textMuted}}>→</div>
        <div style={{fontSize:28}}>😊</div>
      </div>
    </>},
    {title:"Підтримуй малий бізнес",desc:"Купуй напряму у фермерів та майстрів України",icon:"🇺🇦",elements:<>
      <div style={{...getS().flex,justifyContent:"center",gap:4,marginTop:8}}>{["🌾","🐝","👩‍🍳","🧶","☕","🐄","🕯"].map((e,i)=><span key={i} style={{fontSize:16,animation:`float ${1.5+i*0.2}s ease-in-out infinite alternate`}}>{e}</span>)}</div>
    </>},
  ];
  useEffect(()=>{const iv=setInterval(()=>setFrame(f=>(f+1)%scenes.length),3500);return ()=>clearInterval(iv);},[]);
  const sc=scenes[frame];
  return <>
    <div style={{background:bg0,borderRadius:14,padding:14,position:"relative",overflow:"hidden",minHeight:110}}>
      <div style={{...getS().flex,gap:10,marginBottom:4}}>
        <span style={{fontSize:28}}>{sc.icon}</span>
        <div>
          <div style={{fontSize:15,fontWeight:900,color:T.text}}>{sc.title}</div>
          <div style={{fontSize:10,color:T.textSec,lineHeight:1.4}}>{sc.desc}</div>
        </div>
      </div>
      {sc.elements}
      <div style={{...getS().flex,justifyContent:"center",gap:5,marginTop:8}}>
        {scenes.map((_,i)=><div key={i} onClick={()=>setFrame(i)} style={{width:i===frame?16:6,height:4,borderRadius:2,background:i===frame?T.text+"88":T.text+"22",transition:"all .3s",cursor:"pointer"}}/>)}
      </div>
    </div>
    <style>{`
      @keyframes float{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}
      @keyframes grow{0%,100%{width:40%}50%{width:85%}}
      @keyframes pop{0%{transform:scale(0)}100%{transform:scale(1)}}
    `}</style>
  </>;
}

function HotSlider({ deals, onOpen }) {
  const hot=deals.filter(d=>d.hot).slice(0,6);
  const [idx,setIdx]=useState(0);
  const [touchX,setTouchX]=useState(null);
  if(!hot.length) return null;
  const d=hot[idx];
  const go=(dir)=>setIdx(i=>(i+dir+hot.length)%hot.length);
  return <div style={{ padding:"0 16px 12px" }}>
    <div style={{ ...getS().flex,justifyContent:"space-between",marginBottom:8 }}>
      <span style={{ fontSize:12,fontWeight:800,color:T.text }}>Топ дня</span>
      <span style={{ fontSize:10,color:T.textMuted }}>{idx+1}/{hot.length}</span>
    </div>
    <div onClick={()=>onOpen(d)}
      onTouchStart={e=>setTouchX(e.touches[0].clientX)}
      onTouchEnd={e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>40){dx<0?go(1):go(-1);}setTouchX(null);}}
      onMouseDown={e=>setTouchX(e.clientX)}
      onMouseUp={e=>{if(touchX===null)return;const dx=e.clientX-touchX;if(Math.abs(dx)>40){dx<0?go(1):go(-1);}setTouchX(null);}}
      style={{ background:`linear-gradient(135deg,${T.accent}12,${T.gradB}0a)`,borderRadius:14,padding:12,cursor:"pointer",border:`1px solid ${T.border}33`,userSelect:"none" }}>
      <div style={{ ...getS().flex,gap:10 }}>
        <div style={{ fontSize:32 }}>{d.avatar}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:13,fontWeight:800,color:T.text,lineHeight:1.3 }}>{d.title}</div>
          <div style={{ fontSize:10,color:T.textSec,marginTop:2 }}>{d.seller} · {d.city}</div>
          <div style={{ ...getS().flex,gap:4,marginTop:4 }}>
            <span style={{ fontSize:10,color:T.textMuted }}>{d.joined}/{d.needed} учасників</span>
            <span style={{ fontSize:10,color:T.textMuted }}>· {d.days} дн.</span>
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontSize:18,fontWeight:900,color:T.green }}>₴{d.group}</div>
          <div style={{ fontSize:10,color:T.textMuted,textDecoration:"line-through" }}>₴{d.retail}</div>
          <Badge bg={T.orange} color="#fff">-{disc(d)}%</Badge>
        </div>
      </div>
      <div style={{ ...getS().flex,justifyContent:"center",gap:6,marginTop:8 }}>
        {hot.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}} style={{ width:i===idx?18:6,height:5,borderRadius:3,background:i===idx?T.accent:T.textMuted+"33",transition:"all .2s",cursor:"pointer" }}/>)}
      </div>
    </div>
  </div>;
}

function MarketPage({ deals, joined, onJoin, onOpen, user, onCreateDeal, theme, onTheme, onRefresh }) {
  const [cat,setCat]=useState("all"),[search,setSearch]=useState(""),[sort,setSort]=useState("hot"),[showF,setShowF]=useState(false),[cityF,setCityF]=useState("all"),[priceF,setPriceF]=useState("all"),[discF,setDiscF]=useState("all"),[ratingF,setRatingF]=useState("all"),[daysF,setDaysF]=useState("all");
  const cities=["all",...new Set(deals.map(d=>d.city.split(",")[0].trim()))];
  const activeFilters=[cityF!=="all",priceF!=="all",discF!=="all",ratingF!=="all",daysF!=="all"].filter(Boolean).length;
  let list=cat==="all"?deals:deals.filter(d=>d.cat===cat);
  if(search) list=list.filter(d=>(d.title+d.seller).toLowerCase().includes(search.toLowerCase()));
  if(cityF!=="all") list=list.filter(d=>d.city.includes(cityF));
  if(priceF==="low") list=list.filter(d=>d.group<200);
  else if(priceF==="mid") list=list.filter(d=>d.group>=200&&d.group<500);
  else if(priceF==="high") list=list.filter(d=>d.group>=500);
  if(discF==="big") list=list.filter(d=>disc(d)>=30);
  else if(discF==="med") list=list.filter(d=>disc(d)>=20&&disc(d)<30);
  else if(discF==="small") list=list.filter(d=>disc(d)<20);
  if(ratingF==="top") list=list.filter(d=>d.rating>=4.8);
  else if(ratingF==="good") list=list.filter(d=>d.rating>=4.5);
  if(daysF==="today") list=list.filter(d=>d.days<=1);
  else if(daysF==="week") list=list.filter(d=>d.days<=3);
  else if(daysF==="later") list=list.filter(d=>d.days>3);
  list=[...list].sort(sort==="new"?(a,b)=>b.id-a.id:sort==="disc"?(a,b)=>disc(b)-disc(a):sort==="price"?(a,b)=>a.group-b.group:sort==="rating"?(a,b)=>b.rating-a.rating:(a,b)=>pct(b)-pct(a));

  return <div style={{ position:"relative" }}>
    <div style={{ padding:"16px 16px 12px" }}>
      <div style={{ ...S.flex,justifyContent:"space-between",marginBottom:12 }}>
        <div>
          <div style={{ fontSize:22,fontWeight:900,color:T.text }}>Spil</div>
          <div style={{ fontSize:11,color:T.green }}>{user?`${user.name}, вітаємо!`:"Купуй разом — плати менше"}</div>
        </div>
        <button onClick={()=>onTheme(theme==="light"?"ocean":"light")} style={{ ...S.btn,width:40,height:40,borderRadius:12,background:T.cardAlt,color:T.text,fontSize:20,...S.flex,justifyContent:"center" }}>
          {theme==="light"?"☀️":"🌙"}
        </button>
      </div>
      <HowItWorks/>
    </div>

    <HotSlider deals={deals} onOpen={onOpen}/>
    <div style={{ padding:"0 16px 10px" }}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Пошук..." style={{ width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",color:T.text,fontSize:13,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }}/></div>

    <div style={{ display:"flex",gap:6,padding:"0 16px 10px",overflowX:"auto",scrollbarWidth:"none" }}>
      {CATEGORIES.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{ ...S.btn,whiteSpace:"nowrap",padding:"6px 12px",borderRadius:12,fontSize:11,background:cat===c.id?T.accent:T.card,color:cat===c.id?"#fff":T.textSec,border:`1px solid ${cat===c.id?T.accent:T.border}` }}>{c.icon} {c.label}</button>)}
    </div>

    <div style={{ ...S.flex,gap:4,padding:"0 16px 10px",flexWrap:"wrap" }}>
      {[["hot","Популярні"],["new","Нові"],["disc","Знижка"],["price","Ціна ↑"],["rating","Рейтинг"]].map(([s,l])=>
        <button key={s} onClick={()=>setSort(s)} style={{ ...S.btn,padding:"5px 10px",borderRadius:8,fontSize:10,background:sort===s?T.accent+"22":"transparent",color:sort===s?T.accent:T.textSec }}>{l}</button>
      )}
      <button onClick={()=>setShowF(!showF)} style={{ ...S.btn,...S.flex,gap:3,marginLeft:"auto",padding:"5px 10px",borderRadius:8,fontSize:10,background:showF?T.accent+"22":"transparent",color:showF?T.accent:T.textSec }}>
        {I.filter} {activeFilters>0?`(${activeFilters})`:""}
      </button>
    </div>

    {showF&&<div style={{ ...S.card,margin:"0 16px 12px",padding:12 }}>
      <div style={{...S.flex,justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:800,color:T.text}}>Фільтри</span>
        {activeFilters>0&&<button onClick={()=>{setCityF("all");setPriceF("all");setDiscF("all");setRatingF("all");setDaysF("all");}} style={{...S.btn,fontSize:9,color:T.accent,background:"transparent",padding:0}}>Скинути все</button>}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T.textSec,marginBottom:4}}>Місто</div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
        {cities.map(c=><button key={c} onClick={()=>setCityF(c)} style={{...S.btn,padding:"4px 8px",borderRadius:6,fontSize:9,background:cityF===c?T.accent:T.cardAlt,color:cityF===c?"#fff":T.textSec}}>{c==="all"?"Всі міста":c}</button>)}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T.textSec,marginBottom:4}}>Ціна</div>
      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {[["all","Будь-яка"],["low","до ₴200"],["mid","₴200–500"],["high","₴500+"]].map(([v,l])=>
          <button key={v} onClick={()=>setPriceF(v)} style={{...S.btn,padding:"4px 8px",borderRadius:6,fontSize:9,background:priceF===v?T.accent:T.cardAlt,color:priceF===v?"#fff":T.textSec}}>{l}</button>
        )}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T.textSec,marginBottom:4}}>Знижка</div>
      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {[["all","Будь-яка"],["big","30%+"],["med","20–30%"],["small","до 20%"]].map(([v,l])=>
          <button key={v} onClick={()=>setDiscF(v)} style={{...S.btn,padding:"4px 8px",borderRadius:6,fontSize:9,background:discF===v?T.accent:T.cardAlt,color:discF===v?"#fff":T.textSec}}>{l}</button>
        )}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T.textSec,marginBottom:4}}>Рейтинг</div>
      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {[["all","Всі"],["top","4.8+"],["good","4.5+"]].map(([v,l])=>
          <button key={v} onClick={()=>setRatingF(v)} style={{...S.btn,padding:"4px 8px",borderRadius:6,fontSize:9,background:ratingF===v?T.accent:T.cardAlt,color:ratingF===v?"#fff":T.textSec}}>{l}</button>
        )}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T.textSec,marginBottom:4}}>Термін</div>
      <div style={{display:"flex",gap:3}}>
        {[["all","Всі"],["today","Сьогодні"],["week","До 3 днів"],["later","Пізніше"]].map(([v,l])=>
          <button key={v} onClick={()=>setDaysF(v)} style={{...S.btn,padding:"4px 8px",borderRadius:6,fontSize:9,background:daysF===v?T.accent:T.cardAlt,color:daysF===v?"#fff":T.textSec}}>{l}</button>
        )}
      </div>
    </div>}

    <div style={{padding:"0 16px 4px",fontSize:10,color:T.textMuted}}>{list.length} оголошень</div>
    <div style={{ padding:"0 16px 90px",display:"flex",flexDirection:"column",gap:10 }}>
      {list.map(d=><DealCard key={d.id} deal={d} onOpen={onOpen} joined={joined} onJoin={onJoin} onRefresh={onRefresh}/>)}
      {list.length===0&&<div style={{ textAlign:"center",padding:60,color:T.textMuted }}>Нічого не знайдено</div>}
    </div>

    <button onClick={onCreateDeal} style={{ ...S.btn,position:"fixed",bottom:84,right:20,width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.green})`,color:"#fff",boxShadow:"0 4px 20px rgba(34,197,94,0.3)",zIndex:90,...S.flex,justifyContent:"center" }}>{I.plus}</button>
  </div>;
}

// ── Створення оголошення ────────────────────────────────────────────────────
// ── Карта Вінниці (OpenStreetMap) ────────────────────────────────────────────
const SHOPS=[
  {name:"Ферма Петренків",lat:49.2331,lng:28.4682,type:"farm"},
  {name:"Пасіка Коваля",lat:49.2295,lng:28.4785,type:"honey"},
  {name:"Пекарня Оленки",lat:49.2350,lng:28.4590,type:"food"},
  {name:"Молочна від Галини",lat:49.2270,lng:28.4720,type:"dairy"},
  {name:"Кав'ярня Зерно",lat:49.2315,lng:28.4650,type:"cafe"},
  {name:"Еко-ферма Зелений Гай",lat:49.2380,lng:28.4550,type:"veggies"},
  {name:"Сироварня Карпат",lat:49.2260,lng:28.4830,type:"dairy"},
  {name:"Ринок Урожай",lat:49.2340,lng:28.4710,type:"farm"},
];

function MapView({ label, height=200, shops=true, route }) {
  const center={lat:49.2328,lng:28.4687};
  const zoom=route?15:14;
  const markers=shops?SHOPS.map(s=>`${s.lat},${s.lng},${encodeURIComponent(s.name)}`).join("~"):"";
  return <div style={{position:"relative",borderRadius:12,overflow:"hidden",height,border:`1px solid ${T.border}33`}}>
    <iframe
      title="map"
      width="100%" height="100%"
      style={{border:0,filter:"brightness(0.85) contrast(1.1) saturate(0.8)"}}
      loading="lazy"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng-0.02},${center.lat-0.012},${center.lng+0.02},${center.lat+0.012}&layer=mapnik&marker=${center.lat},${center.lng}`}
    />
    {shops&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none"}}>
      {SHOPS.map((s,i)=>{
        const x=((s.lng-center.lng+0.02)/0.04)*100;
        const y=((center.lat+0.012-s.lat)/0.024)*100;
        return <div key={i} style={{position:"absolute",left:`${x}%`,top:`${y}%`,transform:"translate(-50%,-100%)",pointerEvents:"auto",cursor:"pointer"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.accent,border:"2px solid #fff",boxShadow:"0 1px 4px rgba(0,0,0,0.4)"}}/>
        </div>;
      })}
    </div>}
    {route&&<div style={{position:"absolute",bottom:6,left:6,right:6,...getS().flex,justifyContent:"space-between"}}>
      <span style={{fontSize:9,background:T.accent+"dd",color:"#fff",padding:"2px 8px",borderRadius:4}}>Продавець</span>
      <span style={{fontSize:9,background:T.card+"cc",color:T.textSec,padding:"2px 8px",borderRadius:4}}>{route==="delivering"?"В дорозі ~15хв":route==="ready"?"Доставлено":"Очікує"}</span>
      <span style={{fontSize:9,background:"#ef4444dd",color:"#fff",padding:"2px 8px",borderRadius:4}}>Ви</span>
    </div>}
    {label&&<div style={{position:"absolute",bottom:route?28:6,left:6,fontSize:10,color:"#fff",background:"rgba(0,0,0,0.6)",padding:"3px 10px",borderRadius:6,fontWeight:700}}>{label}</div>}
  </div>;
}

function RouteMap({ status }) {
  return <MapView height={160} shops={false} route={status==="active"?"delivering":status==="scanned"?"ready":"done"} label="Вінниця, центр"/>;
}

function CreateDealPage({ onBack, onSave }) {
  const [title,setTitle]=useState(""),[cat,setCat]=useState("food"),[price,setPrice]=useState(""),[retail,setRetail]=useState(""),[unit,setUnit]=useState("шт"),[min,setMin]=useState("1"),[max,setMax]=useState("10"),[needed,setNeeded]=useState("20"),[days,setDays]=useState("7"),[desc,setDesc]=useState(""),[city,setCity]=useState(""),[address,setAddress]=useState(""),[coords,setCoords]=useState(""),[pin,setPin]=useState({x:50,y:45}),[photo,setPhoto]=useState(null);
  const [saving,setSaving]=useState(false),[error,setError]=useState("");
  const [deliveryTags,setDeliveryTags]=useState(["Самовивіз"]);
  const [customTags,setCustomTags]=useState("");
  const [autoConf,setAutoConf]=useState(false);

  const units=["шт","кг","л","набір","пачка","лоток","банка","упаковка"];
  const deliveryOptions=["Самовивіз","Доставка","Нова Пошта","Укрпошта","Meest"];
  const toggleDelivery=(tag)=>setDeliveryTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]);

  const [tried,setTried]=useState(false);
  const canSave = title && price && retail && Number(price)<Number(retail) && city && desc && unit && needed && days;
  const miss=(field)=>tried&&!field;
  const reqStyle=(field)=>miss(field)?{border:`2px solid #ef4444`,borderRadius:14}:{};
  const allTags=[...deliveryTags,...(customTags?customTags.split(",").map(t=>t.trim()).filter(Boolean):[])];

  const Label=({text,hint,required})=><div style={{marginBottom:6}}>
    <span style={{fontSize:12,fontWeight:700,color:T.text}}>{text}</span>
    {required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}
    {hint&&<span style={{fontSize:10,color:T.textMuted,marginLeft:6}}>{hint}</span>}
  </div>;

  return <div style={S.page}>
    <BackBtn onClick={onBack}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Нове оголошення</h2>
    <p style={{ fontSize:12,color:T.textSec,marginBottom:16 }}>Заповніть інформацію про товар або послугу</p>
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

      <div>
        <Label text="Фото товару" hint="(необов'язково)"/>
        <label style={{ ...S.card,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:16,cursor:"pointer",borderStyle:"dashed" }}>
          {photo?<img src={photo} alt="" style={{width:"100%",height:120,objectFit:"cover",borderRadius:8}}/>:
          <>{I.cam}<div style={{fontSize:11,color:T.textMuted}}>Натисніть щоб додати фото</div></>}
          <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const img=new Image();const r=new FileReader();r.onload=ev=>{img.onload=()=>{const max=800;let w=img.width,h=img.height;if(w>max||h>max){if(w>h){h=Math.round(h*max/w);w=max;}else{w=Math.round(w*max/h);h=max;}}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);setPhoto(c.toDataURL('image/jpeg',0.7));};img.src=ev.target.result;};r.readAsDataURL(f);}}}/>
        </label>
      </div>

      <div style={reqStyle(title)}>
        <Label text="Назва" hint="Що продаєте?" required/>
        <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Наприклад: Мед акацієвий 1л"/>
        {miss(title)&&<div style={{fontSize:10,color:"#ef4444",marginTop:4}}>Введіть назву товару</div>}
      </div>

      <div>
        <Label text="Категорія" required/>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {CATEGORIES.filter(c=>c.id!=="all").map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{ ...S.btn,padding:"6px 10px",borderRadius:10,fontSize:10,background:cat===c.id?T.accent:T.cardAlt,color:cat===c.id?"#fff":T.textSec }}>{c.icon} {c.label}</button>)}
        </div>
      </div>

      <div>
        <Label text="Ціна (₴)" hint="Групова має бути менше роздрібної" required/>
        <div style={{ display:"flex",gap:8 }}>
          <div style={{ flex:1,...reqStyle(price) }}><Input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Групова ціна, ₴" type="number"/></div>
          <div style={{ flex:1,...reqStyle(retail) }}><Input value={retail} onChange={e=>setRetail(e.target.value)} placeholder="Роздрібна ціна, ₴" type="number"/></div>
        </div>
        {(miss(price)||miss(retail))&&<div style={{fontSize:10,color:"#ef4444",marginTop:4}}>Вкажіть обидві ціни</div>}
        {price&&retail&&Number(price)>=Number(retail)&&<div style={{fontSize:10,color:"#ef4444",marginTop:4}}>Групова ціна має бути менше роздрібної</div>}
        {price&&retail&&Number(price)<Number(retail)&&<div style={{fontSize:10,color:T.green,marginTop:4}}>Знижка: {Math.round((1-Number(price)/Number(retail))*100)}%</div>}
      </div>

      <div>
        <Label text="Одиниця виміру" required/>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {units.map(u=><button key={u} onClick={()=>setUnit(u)} style={{ ...S.btn,padding:"6px 12px",borderRadius:10,fontSize:11,background:unit===u?T.accent:T.cardAlt,color:unit===u?"#fff":T.textSec }}>{u}</button>)}
        </div>
      </div>

      <div>
        <Label text="Кількість" hint="Мін / Макс на одного покупця"/>
        <div style={{ display:"flex",gap:8 }}>
          <div style={{ flex:1 }}><Input value={min} onChange={e=>setMin(e.target.value)} placeholder="Мін: 1" type="number"/></div>
          <div style={{ flex:1 }}><Input value={max} onChange={e=>setMax(e.target.value)} placeholder="Макс: 10" type="number"/></div>
        </div>
      </div>

      <div>
        <div style={{ display:"flex",gap:8 }}>
          <div style={{ flex:1,...reqStyle(needed) }}>
            <Label text="Учасників потрібно" required/>
            <Input value={needed} onChange={e=>setNeeded(e.target.value)} placeholder="20" type="number"/>
          </div>
          <div style={{ flex:1,...reqStyle(days) }}>
            <Label text="Термін (днів)" required/>
            <Input value={days} onChange={e=>setDays(e.target.value)} placeholder="7" type="number"/>
          </div>
        </div>
      </div>

      <div style={reqStyle(desc)}>
        <Label text="Опис товару" hint="Коротко про якість, склад, особливості" required/>
        <Input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Натуральний продукт без ГМО..." area/>
        {miss(desc)&&<div style={{fontSize:10,color:"#ef4444",marginTop:4}}>Додайте опис</div>}
      </div>

      <div>
        <Label text="Спосіб отримання" hint="(оберіть один або кілька)"/>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {deliveryOptions.map(d=><button key={d} onClick={()=>toggleDelivery(d)} style={{ ...S.btn,padding:"6px 12px",borderRadius:10,fontSize:11,background:deliveryTags.includes(d)?T.accent:T.cardAlt,color:deliveryTags.includes(d)?"#fff":T.textSec }}>{d}</button>)}
        </div>
      </div>

      <div>
        <div onClick={()=>setAutoConf(!autoConf)} style={{...S.flex,gap:10,cursor:"pointer",padding:"10px 0"}}>
          <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${autoConf?T.accent:T.border}`,background:autoConf?T.accent:"transparent",...S.flex,justifyContent:"center"}}>
            {autoConf&&<span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>}
          </div>
          <div><div style={{fontSize:12,fontWeight:700,color:T.text}}>Автопідтвердження видачі</div><div style={{fontSize:10,color:T.textSec}}>Покупець отримує товар без QR сканування</div></div>
        </div>

        <Label text="Додаткові теги" hint="(необов'язково, через кому)"/>
        <Input value={customTags} onChange={e=>setCustomTags(e.target.value)} placeholder="Органік, Без ГМО, Сертифікат"/>
      </div>

      <div style={{ ...S.card,background:T.greenLight }}>
        <Label text="Місце отримання" required/>
        <div style={reqStyle(city)}><Input value={city} onChange={e=>setCity(e.target.value)} placeholder="Місто" icon={I.pin}/></div>
        {miss(city)&&<div style={{fontSize:10,color:"#ef4444",marginTop:4}}>Вкажіть місто</div>}
        <div style={{marginTop:8}}>
          <Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Адреса: вул. Хрещатик, 1"/>
        </div>
        <div style={{marginTop:8}}>
          <Input value={coords} onChange={e=>setCoords(e.target.value)} placeholder="Координати: 50.4501, 30.5234"/>
          <div style={{fontSize:9,color:T.textMuted,marginTop:4}}>Відкрийте Google Maps → ПКМ на точці → Копіювати координати</div>
        </div>
        <div style={{marginTop:8}}>
          <div style={{fontSize:10,fontWeight:700,color:T.text,marginBottom:4}}>Або вкажіть на карті</div>
          <MapView pin={pin} onPin={setPin} label={address||city||"Оберіть місце"}/>
        </div>
      </div>

      {allTags.length>0&&<div>
        <div style={{fontSize:10,color:T.textSec,marginBottom:4}}>Теги:</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {allTags.map((t,i)=><span key={i} style={{background:T.cardAlt,color:T.textSec,fontSize:10,padding:"3px 8px",borderRadius:6}}>{t}</span>)}
        </div>
      </div>}

      {error&&<div style={{ color:"#ef4444",fontSize:12 }}>{error}</div>}
      <button onClick={async()=>{setTried(true);if(!canSave||saving) return;
        setSaving(true);setError("");
        try{
          const deadline=new Date();deadline.setDate(deadline.getDate()+parseInt(days));
          const fullCity=address?`${city}, ${address}`:city;
          await createDeal({title,description:desc,category:cat,retailPrice:+retail,groupPrice:+price,unit,minQty:+min,maxQty:+max,needed:+needed,deadline:deadline.toISOString(),images:photo?[photo]:[],tags:allTags,city:fullCity,autoConfirm:autoConf});
          onSave();
        }catch(e){setError(e.message);}
        finally{setSaving(false);}
      }} style={{ ...S.btn,width:"100%",padding:15,background:canSave&&!saving?`linear-gradient(135deg,${T.accent},${T.green})`:T.cardAlt,color:canSave?"#fff":T.textMuted,borderRadius:14,fontSize:15 }}>{saving?"Публікуємо...":"Опублікувати"}</button>
    </div>
  </div>;
}

// ── Деталі угоди ────────────────────────────────────────────────────────────
function DealDetail({ deal, onBack, joined, onJoin, onBuy, onChat, onRefresh }) {
  const [qty,setQty]=useState(deal.min);
  const [joining,setJoining]=useState(false);
  const p=pct(deal),d=disc(deal),isIn=joined[deal.id],col=pCol(p);
  return <div style={{ paddingBottom:100 }}>
    <div style={{ background:`linear-gradient(180deg,${T.greenLight},${T.card})`,padding:"20px 16px 20px" }}>
      <BackBtn onClick={onBack}/>
      <div style={{ ...S.flex,gap:8,marginBottom:10 }}>
        {deal.hot&&<Badge bg={T.orange} color="#fff">HOT</Badge>}
        <Badge>-{d}%</Badge>
      </div>
      <h1 style={{ fontSize:22,fontWeight:900,color:T.text,margin:"0 0 14px",lineHeight:1.3 }}>{deal.title}</h1>
      <div style={{ ...S.card,background:T.greenLight,...S.flex,gap:12 }}>
        <Ic emoji={deal.avatar} size={48}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14,fontWeight:800,color:T.text }}>{deal.seller}</div>
          <div style={{ ...S.flex,gap:4,fontSize:11,color:T.textSec,marginTop:2 }}>{I.pin} {deal.city}</div>
        </div>
        {isLoggedIn()&&deal.sellerId&&<button onClick={()=>onChat&&onChat(deal.sellerId,deal.dbId||deal.id)} style={{ ...S.btn,...S.flex,gap:4,padding:"8px 12px",borderRadius:10,background:T.accent,color:"#fff",fontSize:11 }}>{I.msg} Написати</button>}
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
      {!isLoggedIn()?<div style={{ textAlign:"center",padding:14 }}>
        <div style={{ fontSize:12,color:T.textSec,marginBottom:8 }}>Увійдіть щоб долучитись</div>
        <div style={{ fontSize:10,color:T.textMuted }}>Вкладка Гаманець → Увійти або Створити акаунт</div>
      </div>:isIn?<div style={{ ...S.flex,gap:8 }}>
        <div style={{ flex:1,background:T.greenLight,borderRadius:12,padding:12,textAlign:"center" }}><div style={{ fontSize:13,fontWeight:800,color:T.green }}>В групі! ({qty} {deal.unit})</div></div>
        <button onClick={()=>onBuy(deal,qty)} style={{ ...S.btn,background:"#6366f1",color:"#fff",borderRadius:12,padding:"12px 18px",fontSize:12 }}>QR</button>
        {deal.sellerId&&<button onClick={()=>onChat&&onChat(deal.sellerId,deal.dbId||deal.id)} style={{ ...S.btn,background:T.cardAlt,color:T.text,borderRadius:12,padding:"12px 14px",fontSize:12 }}>{I.msg}</button>}
      </div>:<button disabled={joining} onClick={async()=>{
        setJoining(true);
        try{const order=await createOrder(deal.dbId||deal.id,qty);onJoin(deal.id);if(onRefresh)onRefresh();onBuy(deal,qty,order.id);}catch(e){alert(e.message);}
        finally{setJoining(false);}
      }} style={{ ...S.btn,width:"100%",padding:14,background:joining?T.cardAlt:`linear-gradient(135deg,${T.accent},${T.green})`,borderRadius:14,color:"#fff",fontSize:15 }}>{joining?"Обробка...":(`Долучитись · ₴${deal.group*qty}`)}</button>}
    </div>
  </div>;
}

// ── Мої покупки ─────────────────────────────────────────────────────────────
function MyDealsPage({ deals, joined, onOpen }) {
  const my=deals.filter(d=>joined[d.id]);
  return <div style={S.page}>
    <h2 style={{ color:T.text,fontSize:22,fontWeight:900,marginBottom:4 }}>Мої покупки</h2>
    <p style={{ color:T.textSec,fontSize:12,marginBottom:16 }}>{my.length} активних</p>
    {my.length===0?<div style={{ textAlign:"center",padding:60 }}><div style={{ fontSize:48 }}>🛒</div><div style={{ color:T.textMuted,marginTop:12,fontSize:13 }}>Ще нічого немає</div></div>:
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>{my.map(d=>{const p=pct(d);return <div key={d.id} onClick={()=>onOpen(d)} style={{ ...S.card,cursor:"pointer" }}>
      <div style={{ ...S.flex,gap:10,marginBottom:8 }}><Ic emoji={d.avatar} size={40}/><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:800,color:T.text }}>{d.title}</div><div style={{ fontSize:10,color:T.textSec }}>{d.seller}</div></div><div style={{ textAlign:"right" }}><div style={{ fontSize:16,fontWeight:900,color:T.green }}>₴{d.group}</div></div></div>
      <div style={{ ...S.flex,gap:10 }}><div style={{ flex:1 }}><ProgressBar value={p} color={pCol(p)}/></div><Badge>В групі</Badge></div>
    </div>;})}</div>}
  </div>;
}

// ── QR-код (справжній, сканується камерою) ───────────────────────────────────
function QRCode({ value, size=180 }) {
  const [src,setSrc]=useState("");
  useEffect(()=>{
    if(!value) return;
    QRCodeLib.toDataURL(value,{width:size,margin:2,color:{dark:"#000000",light:"#ffffff"}})
      .then(setSrc).catch(()=>{});
  },[value,size]);
  if(!src) return <div style={{width:size,height:size,background:"#fff",borderRadius:8,...S.flex,justifyContent:"center"}}><div style={{color:"#999",fontSize:10}}>QR...</div></div>;
  return <img src={src} alt="QR" width={size} height={size} style={{borderRadius:8}}/>;
}

function BuyerQRPage({ deal, qty, onBack, orderId }) {
  const [status,setStatus]=useState("active"),[copied,setCopied]=useState(false);
  const [qrToken,setQrToken]=useState(null),[qrLoading,setQrLoading]=useState(true);
  const total=deal.group*qty;

  useEffect(()=>{
    if(!orderId){setQrLoading(false);return;}
    generateQR(orderId).then(data=>{setQrToken(data.token);}).catch(()=>{}).finally(()=>setQrLoading(false));
  },[orderId]);

  // Listen for order completion via WebSocket
  useEffect(()=>{
    const unsub=onEvent('order:completed',(data)=>{
      if(data.orderId===orderId) setStatus("done");
    });
    return ()=>unsub();
  },[orderId]);

  const code=qrToken||"";
  const shortCode=code?code.slice(0,12).toUpperCase():"...";

  return <div style={S.page}>
    <BackBtn onClick={onBack}/>
    <div style={{ ...S.card,textAlign:"center",padding:20 }}>
      <div style={{ ...S.flex,justifyContent:"center",gap:6,marginBottom:14 }}>
        <div style={{ width:8,height:8,borderRadius:"50%",background:status==="done"?T.green:T.accent,animation:status==="active"?"pulse 2s infinite":"none" }}/>
        <span style={{ fontSize:11,fontWeight:700,color:status==="done"?T.green:T.accent }}>{status==="done"?"Товар отримано!":"Покажіть продавцю"}</span>
      </div>
      {qrLoading?<div style={{padding:40,color:T.textSec}}>Генерація QR...</div>
      :status==="done"?<div style={{padding:30}}><div style={{fontSize:48,marginBottom:10}}>✅</div><div style={{fontSize:16,fontWeight:900,color:T.green}}>Видачу підтверджено!</div></div>
      :<div style={{ background:"#fff",borderRadius:T.radius,padding:14,display:"inline-block",marginBottom:14 }}><QRCode value={code} size={200}/></div>}
      {status!=="done"&&<>
        <div style={{ ...S.flex,justifyContent:"center",gap:6,marginBottom:4 }}>
          <span style={{ fontSize:13,fontWeight:900,color:T.text,letterSpacing:1 }}>{shortCode}</span>
          <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{ ...S.btn,background:"transparent",color:copied?T.green:T.textMuted,padding:2 }}>{copied?I.check:I.copy}</button>
        </div>
        <div style={{ fontSize:10,color:T.textMuted,marginBottom:12 }}>Продавець сканує цей код при видачі</div>
      </>}
      <div style={{ fontSize:13,fontWeight:700,color:T.text,marginBottom:8 }}>{deal.title}</div>
      <div style={{ fontSize:12,color:T.textSec,marginBottom:12 }}>{qty} {deal.unit} · {deal.seller}</div>
      <div style={{ ...S.card,background:T.greenLight }}><div style={{ fontSize:11,color:T.green }}>До сплати</div><div style={{ fontSize:28,fontWeight:900,color:T.green }}>₴{total}</div></div>
      <button onClick={()=>{const t=`Spil: ${deal.title} — ${shortCode}`;if(navigator.share)navigator.share({title:"Spil QR",text:t});else{navigator.clipboard.writeText(code);alert("Код скопійовано!");}}}
        style={{ ...S.btn,width:"100%",marginTop:12,padding:12,borderRadius:12,background:T.cardAlt,color:T.text,fontSize:12,...S.flex,justifyContent:"center",gap:6 }}>{I.share} Поділитись кодом</button>
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
  </div>;
}

// ── QR Хаб ──────────────────────────────────────────────────────────────────
function QRHub() {
  const [scanning,setScanning]=useState(false),[scanned,setScanned]=useState(null),[confirmed,setConfirmed]=useState(false);
  const [manualCode,setManualCode]=useState(""),[verifyError,setVerifyError]=useState(""),[verifying,setVerifying]=useState(false);
  const [sellerOrders,setSellerOrders]=useState([]);
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const scanInterval=useRef(null);

  useEffect(()=>{
    if(!isLoggedIn()) return;
    fetchSellerOrders().then(setSellerOrders).catch(()=>{});
    const unsub=onEvent('deal:update',()=>fetchSellerOrders().then(setSellerOrders).catch(()=>{}));
    return ()=>unsub();
  },[]);

  const doVerify=async(token)=>{
    setVerifying(true);setVerifyError("");
    try{
      const res=await verifyQR(token);
      setScanned(res.order);setConfirmed(true);setScanning(false);
      fetchSellerOrders().then(setSellerOrders).catch(()=>{});
    }catch(e){setVerifyError(e.message);}
    finally{setVerifying(false);}
  };

  // Camera scanner with jsQR
  const startCamera=async()=>{
    setScanning(true);setVerifyError("");
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:640},height:{ideal:480}}});
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
      // Start scanning frames
      scanInterval.current=setInterval(()=>{
        if(!videoRef.current||!canvasRef.current) return;
        const video=videoRef.current;
        const canvas=canvasRef.current;
        if(video.readyState!==video.HAVE_ENOUGH_DATA) return;
        canvas.width=video.videoWidth;canvas.height=video.videoHeight;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
        const code=jsQR(imageData.data,imageData.width,imageData.height,{inversionAttempts:"dontInvert"});
        if(code&&code.data){
          stopCamera();
          doVerify(code.data);
        }
      },300);
    }catch(e){setVerifyError("Камера недоступна: "+e.message);setScanning(false);}
  };
  const stopCamera=()=>{
    if(scanInterval.current){clearInterval(scanInterval.current);scanInterval.current=null;}
    if(videoRef.current?.srcObject){videoRef.current.srcObject.getTracks().forEach(t=>t.stop());videoRef.current.srcObject=null;}
    setScanning(false);
  };

  // Success screen
  if(confirmed&&scanned) return <div style={S.page}>
    <div style={{ ...S.card,textAlign:"center",padding:24 }}>
      <div style={{ fontSize:48,marginBottom:10 }}>✅</div>
      <h3 style={{ color:T.green,fontSize:18,fontWeight:900,marginBottom:14 }}>Видачу підтверджено!</h3>
      <div style={{ ...S.card,background:T.greenLight,textAlign:"left",marginBottom:14 }}>
        {[["Покупець",scanned.buyer],["Товар",scanned.item],["Кількість",`${scanned.quantity} ${scanned.unit}`],["Сума",`₴${scanned.amount}`]].map(([k,v])=><div key={k} style={{ ...S.flex,justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}11` }}><span style={{ fontSize:12,color:T.textSec }}>{k}</span><span style={{ fontSize:12,fontWeight:700,color:T.text }}>{v}</span></div>)}
      </div>
      <div style={{fontSize:10,color:T.textSec,marginBottom:14}}>Кошти зараховано на ваш баланс</div>
      <button onClick={()=>{setScanned(null);setConfirmed(false);setManualCode("");}} style={{ ...S.btn,width:"100%",padding:14,background:T.accent,borderRadius:12,color:"#fff",fontSize:14 }}>Готово</button>
    </div>
  </div>;

  // Scanner screen
  if(scanning) return <div style={S.page}>
    <BackBtn onClick={stopCamera}/>
    <div style={{ ...S.card,textAlign:"center",padding:16 }}>
      <div style={{ fontSize:14,fontWeight:800,color:T.text,marginBottom:10 }}>Наведіть камеру на QR код</div>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <div style={{ width:"100%",height:280,background:"#000",borderRadius:T.radius,marginBottom:14,overflow:"hidden",position:"relative" }}>
        <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:160,height:160,border:`3px solid ${T.accent}`,borderRadius:14 }}/>
      </div>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Або введіть код вручну</div>
      <div style={{...S.flex,gap:8}}>
        <Input value={manualCode} onChange={e=>setManualCode(e.target.value)} placeholder="Вставте QR код покупця"/>
        <button disabled={!manualCode||verifying} onClick={()=>doVerify(manualCode)} style={{...S.btn,padding:"12px 16px",borderRadius:12,background:manualCode?T.accent:T.cardAlt,color:manualCode?"#fff":T.textMuted,fontSize:12,whiteSpace:"nowrap"}}>{verifying?"...":"OK"}</button>
      </div>
      {verifyError&&<div style={{color:"#ef4444",fontSize:11,marginTop:8}}>{verifyError}</div>}
    </div>
  </div>;

  const paidOrders=sellerOrders.filter(o=>o.status==="PAID");
  const doneOrders=sellerOrders.filter(o=>o.status==="COMPLETED");

  return <div style={S.page}>
    <h2 style={{ color:T.text,fontSize:22,fontWeight:900,marginBottom:4 }}>QR-центр</h2>
    <p style={{fontSize:11,color:T.textSec,marginBottom:16}}>Скануйте QR покупця для підтвердження видачі</p>

    <div onClick={startCamera} style={{ ...S.card,...S.flex,gap:14,padding:18,cursor:"pointer",marginBottom:14,background:`linear-gradient(135deg,${T.greenLight},${T.greenBorder})` }}>
      <div style={{fontSize:28}}>📷</div>
      <div><div style={{ fontSize:15,fontWeight:800,color:T.text }}>Сканувати QR</div><div style={{ fontSize:11,color:T.textSec }}>Відкрити камеру для сканування</div></div>
    </div>

    <div style={{...S.card,marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Ввести код вручну</div>
      <div style={{...S.flex,gap:8}}>
        <Input value={manualCode} onChange={e=>setManualCode(e.target.value)} placeholder="Вставте код від покупця"/>
        <button disabled={!manualCode||verifying} onClick={()=>doVerify(manualCode)} style={{...S.btn,padding:"12px 20px",borderRadius:12,background:manualCode?T.accent:T.cardAlt,color:manualCode?"#fff":T.textMuted,fontSize:13}}>{verifying?"Перевірка...":"Підтвердити"}</button>
      </div>
      {verifyError&&<div style={{color:"#ef4444",fontSize:11,marginTop:8}}>{verifyError}</div>}
    </div>

    {paidOrders.length>0&&<>
      <h3 style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:8}}>Очікують видачі ({paidOrders.length})</h3>
      {paidOrders.map(o=><div key={o.id} style={{ ...S.card,...S.flex,gap:10,marginBottom:8 }}>
        <Ic emoji="📦" size={40}/>
        <div style={{ flex:1 }}><div style={{ fontSize:12,fontWeight:700,color:T.text }}>{o.buyer?.name||"Покупець"}</div><div style={{ fontSize:10,color:T.textSec }}>{o.deal?.title} × {o.quantity} {o.deal?.unit}</div></div>
        <div style={{ textAlign:"right" }}><div style={{ fontSize:13,fontWeight:800,color:T.green }}>₴{Number(o.amount)}</div><Badge bg="#fef9c3" color="#a16207">Оплачено</Badge></div>
      </div>)}
    </>}

    {doneOrders.length>0&&<>
      <h3 style={{fontSize:13,fontWeight:800,color:T.text,margin:"12px 0 8px"}}>Видані ({doneOrders.length})</h3>
      {doneOrders.slice(0,5).map(o=><div key={o.id} style={{ ...S.card,...S.flex,gap:10,marginBottom:8,opacity:.5 }}>
        <Ic emoji="✅" size={36}/>
        <div style={{ flex:1 }}><div style={{ fontSize:11,fontWeight:700,color:T.text }}>{o.buyer?.name||"Покупець"}</div><div style={{ fontSize:10,color:T.textSec }}>{o.deal?.title}</div></div>
        <Badge>Видано</Badge>
      </div>)}
    </>}

    {paidOrders.length===0&&doneOrders.length===0&&<div style={{textAlign:"center",padding:30,color:T.textMuted}}>
      <div style={{fontSize:36,marginBottom:8}}>📦</div>
      <div style={{fontSize:12}}>Поки немає замовлень</div>
    </div>}
  </div>;
}

// ── Дашборд продавця ────────────────────────────────────────────────────────
// ── Месенджер ──────────────────────────────────────────────────────────────
const chatCache={chats:null,loaded:false};
function ChatPage() {
  const [chats,setChats]=useState(chatCache.chats||[]);
  const [activeChat,setActiveChat]=useState(null);
  const [msg,setMsg]=useState("");
  const [messages,setMessages]=useState([]);
  const [loading,setLoading]=useState(!chatCache.loaded);
  const userId=(() => { try { return JSON.parse(localStorage.getItem("spilnokup_user"))?.id; } catch { return null; } })();

  // Support chat state
  const [supportMessages,setSupportMessages]=useState(()=>{try{return JSON.parse(localStorage.getItem("spilnokup_support_msgs"))||[];}catch{return [];}});
  const [supportActive,setSupportActive]=useState(false);
  const hasSupportChat=supportMessages.length>0;

  const saveSupportMsgs=(msgs)=>{setSupportMessages(msgs);localStorage.setItem("spilnokup_support_msgs",JSON.stringify(msgs));};

  // Poll for support replies every 5 seconds
  useEffect(()=>{
    const user=(() => { try { return JSON.parse(localStorage.getItem("spilnokup_user")); } catch { return null; } })();
    if(!user?.phone) return;
    // Normalize phone to +380 format
    let ph=user.phone.replace(/[\s\-\(\)]/g,'');
    if(ph.startsWith('0')&&ph.length===10) ph='+380'+ph.slice(1);
    if(ph.startsWith('380')) ph='+'+ph;
    if(!ph.startsWith('+')) ph='+'+ph;
    const poll=setInterval(async()=>{
      try{
        const res=await fetch(`${API}/telegram/support/replies?phone=${encodeURIComponent(ph)}`);
        const data=await res.json();
        if(data.replies&&data.replies.length>0){
          setSupportMessages(prev=>{
            const newMsgs=data.replies.map(r=>({id:Date.now()+Math.random(),text:r.text,from:"support",time:r.time}));
            const updated=[...prev,...newMsgs];
            localStorage.setItem("spilnokup_support_msgs",JSON.stringify(updated));
            return updated;
          });
        }
      }catch{}
    },5000);
    return ()=>clearInterval(poll);
  },[]);

  useEffect(()=>{
    if(!isLoggedIn()) { setLoading(false); return; }
    // Load in background without blocking UI if cached
    fetchConversations().then(c=>{setChats(c);chatCache.chats=c;chatCache.loaded=true;}).catch(()=>{}).finally(()=>setLoading(false));
    const unsub=onEvent('chat:new',(data)=>{
      fetchConversations().then(c=>{setChats(c);chatCache.chats=c;}).catch(()=>{});
      if(data.conversationId===activeChat){
        setMessages(prev=>[...prev,data.message]);
      }
    });
    return ()=>unsub();
  },[activeChat]);

  const openChat=async(chatId)=>{
    setActiveChat(chatId);
    joinConversation(chatId);
    try{const msgs=await fetchMessages(chatId);setMessages(msgs);}catch{}
  };

  const sendMsg=async()=>{
    if(!msg.trim()||!activeChat) return;
    try{
      const m=await sendMessageApi(activeChat,msg.trim());
      setMessages(prev=>[...prev,m]);setMsg("");
    }catch(e){alert(e.message);}
  };

  // WebSocket for live messages in active chat
  useEffect(()=>{
    if(!activeChat) return;
    const unsub=onEvent('chat:message',(data)=>{
      if(data.senderId!==userId) setMessages(prev=>[...prev,data]);
    });
    return ()=>unsub();
  },[activeChat,userId]);

  const fmtTime=(d)=>{const dt=new Date(d);return `${dt.getHours()}:${String(dt.getMinutes()).padStart(2,"0")}`;};

  // Support chat view
  if(supportActive){
    const user=(() => { try { return JSON.parse(localStorage.getItem("spilnokup_user")); } catch { return null; } })();
    return <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{...S.flex,gap:10,padding:"14px 16px",borderBottom:`1px solid ${T.border}22`}}>
        <button onClick={()=>setSupportActive(false)} style={{...S.btn,background:"none",color:T.accent,padding:0}}>{I.back}</button>
        <Ic emoji="💬" size={36}/>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800,color:T.text}}>Підтримка</div><div style={{fontSize:9,color:T.green}}>Команда СпільноКуп</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:6}}>
        {supportMessages.map((m,i)=>{const mine=m.from!=="support";return <div key={m.id||i} style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"78%"}}>
          <div style={{background:mine?T.accent+"22":T.cardAlt,borderRadius:12,padding:"8px 12px",borderBottomRightRadius:mine?4:12,borderBottomLeftRadius:mine?12:4}}>
            <div style={{fontSize:12,color:T.text,lineHeight:1.4}}>{m.text}</div>
          </div>
          <div style={{fontSize:8,color:T.textMuted,marginTop:2,textAlign:mine?"right":"left"}}>{m.time?new Date(m.time).toLocaleTimeString("uk",{hour:"2-digit",minute:"2-digit"}):""}</div>
        </div>;})}
      </div>
      <div style={{...S.flex,gap:8,padding:"10px 16px",borderTop:`1px solid ${T.border}22`}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&msg.trim()){
          const newMsg={id:Date.now(),text:msg.trim(),from:"me",time:new Date().toISOString()};
          const updated=[...supportMessages,newMsg];saveSupportMsgs(updated);
          fetch(`${API}/telegram/support`,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({message:msg.trim(),userName:user?.name||"User",userPhone:user?.phone||""})}).catch(()=>{});
          setMsg("");}}} placeholder="Повідомлення..."
          style={{flex:1,background:T.cardAlt,border:"none",borderRadius:20,padding:"10px 16px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={()=>{if(!msg.trim()) return;
          const user2=(() => { try { return JSON.parse(localStorage.getItem("spilnokup_user")); } catch { return null; } })();
          const newMsg={id:Date.now(),text:msg.trim(),from:"me",time:new Date().toISOString()};
          const updated=[...supportMessages,newMsg];saveSupportMsgs(updated);
          fetch(`${API}/telegram/support`,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({message:msg.trim(),userName:user2?.name||"User",userPhone:user2?.phone||""})}).catch(()=>{});
          setMsg("");}} style={{...S.btn,width:38,height:38,borderRadius:"50%",background:msg.trim()?T.accent:T.cardAlt,color:msg.trim()?"#fff":T.textMuted,...S.flex,justifyContent:"center"}}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>;
  }

  if(!isLoggedIn()) return <div style={S.page}>
    <h2 style={{color:T.text,fontSize:22,fontWeight:900,marginBottom:14}}>Повідомлення</h2>
    <div style={{...S.card,textAlign:"center",padding:30}}><div style={{fontSize:14,color:T.textSec}}>Створіть акаунт щоб спілкуватись з продавцями</div></div>
  </div>;

  if(activeChat){
    const ch=chats.find(c=>c.id===activeChat);
    return <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{...S.flex,gap:10,padding:"14px 16px",borderBottom:`1px solid ${T.border}22`}}>
        <button onClick={()=>setActiveChat(null)} style={{...S.btn,background:"none",color:T.accent,padding:0}}>{I.back}</button>
        <Ic emoji={ch?.other?.avatarUrl||"💬"} size={36}/>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800,color:T.text}}>{ch?.other?.name||"Чат"}</div>{ch?.deal&&<div style={{fontSize:9,color:T.green}}>{ch.deal.title}</div>}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:6}}>
        {messages.map((m,i)=>{const mine=m.senderId===userId||m.sender?.id===userId;return <div key={m.id||i} style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"78%"}}>
          <div style={{background:mine?T.accent+"22":T.cardAlt,borderRadius:12,padding:"8px 12px",borderBottomRightRadius:mine?4:12,borderBottomLeftRadius:mine?12:4}}>
            <div style={{fontSize:12,color:T.text,lineHeight:1.4}}>{m.text}</div>
          </div>
          <div style={{fontSize:8,color:T.textMuted,marginTop:2,textAlign:mine?"right":"left"}}>{fmtTime(m.createdAt)}</div>
        </div>;})}
      </div>
      <div style={{...S.flex,gap:8,padding:"10px 16px",borderTop:`1px solid ${T.border}22`}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Повідомлення..."
          style={{flex:1,background:T.cardAlt,border:"none",borderRadius:20,padding:"10px 16px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={sendMsg} style={{...S.btn,width:38,height:38,borderRadius:"50%",background:msg.trim()?T.accent:T.cardAlt,color:msg.trim()?"#fff":T.textMuted,...S.flex,justifyContent:"center"}}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>;
  }

  return <div style={S.page}>
    <h2 style={{color:T.text,fontSize:22,fontWeight:900,marginBottom:14}}>Повідомлення</h2>
    {/* Support chat - always on top */}
    {hasSupportChat&&<div onClick={()=>setSupportActive(true)} style={{...S.card,...S.flex,gap:10,marginBottom:8,cursor:"pointer",padding:12,border:`1px solid ${T.accent}33`}}>
      <Ic emoji="💬" size={42}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{...S.flex,justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:13,fontWeight:700,color:T.text}}>Підтримка</span>
          <span style={{fontSize:10,color:T.textMuted}}>{supportMessages.length>0?new Date(supportMessages[supportMessages.length-1].time).toLocaleTimeString("uk",{hour:"2-digit",minute:"2-digit"}):""}</span>
        </div>
        <div style={{fontSize:11,color:T.textSec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{supportMessages[supportMessages.length-1]?.text||"..."}</div>
      </div>
      {supportMessages.filter(m=>m.from==="support"&&!m.read).length>0&&<div style={{width:20,height:20,borderRadius:"50%",background:T.accent,...S.flex,justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{supportMessages.filter(m=>m.from==="support"&&!m.read).length}</div>}
    </div>}
    {loading?<div style={{textAlign:"center",color:T.textSec,padding:20}}>Завантаження...</div>
    :chats.length===0&&!hasSupportChat?<div style={{...S.card,textAlign:"center",padding:30}}><div style={{fontSize:14,color:T.textSec}}>Поки немає повідомлень</div><div style={{fontSize:11,color:T.textMuted,marginTop:4}}>Долучіться до покупки щоб почати чат</div></div>
    :chats.map(ch=><div key={ch.id} onClick={()=>openChat(ch.id)} style={{...S.card,...S.flex,gap:10,marginBottom:8,cursor:"pointer",padding:12}}>
      <Ic emoji={ch.other?.avatarUrl||"💬"} size={42}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{...S.flex,justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:13,fontWeight:700,color:T.text}}>{ch.other?.name||"Чат"}</span>
          <span style={{fontSize:10,color:T.textMuted}}>{ch.lastMessage?fmtTime(ch.lastMessage.createdAt):""}</span>
        </div>
        <div style={{fontSize:11,color:T.textSec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.lastMessage?.text||ch.deal?.title||"..."}</div>
      </div>
      {ch.unread>0&&<div style={{width:20,height:20,borderRadius:"50%",background:T.accent,...S.flex,justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{ch.unread}</div>}
    </div>)}
  </div>;
}

function MyOrderCard({ order: o, onRefresh }) {
  const [showQR,setShowQR]=useState(false);
  const [qrToken,setQrToken]=useState(o.qrToken?.token||null);
  const [qrLoading,setQrLoading]=useState(false);
  const [copied,setCopied]=useState(false);
  const d=o.deal;
  const p=d?Math.min(100,Math.round((d.joined/d.needed)*100)):0;

  const loadQR=async()=>{
    if(qrToken){setShowQR(!showQR);return;}
    setQrLoading(true);
    try{const res=await generateQR(o.id);setQrToken(res.token);setShowQR(true);}catch(e){alert(e.message);}
    finally{setQrLoading(false);}
  };

  // Listen for completion
  useEffect(()=>{
    const unsub=onEvent('order:completed',(data)=>{
      if(data.orderId===o.id&&onRefresh) onRefresh();
    });
    return ()=>unsub();
  },[o.id]);

  const shortCode=qrToken?qrToken.slice(0,12).toUpperCase():"";

  return <div style={{...S.card}}>
    <div style={{...S.flex,gap:10,marginBottom:8}}>
      <Ic emoji="📦" size={36}/>
      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:800,color:T.text}}>{d?.title||"Товар"}</div><div style={{fontSize:10,color:T.textSec}}>{d?.seller?.name||""} · {o.quantity} {d?.unit||"шт"}</div></div>
      <div style={{fontSize:15,fontWeight:900,color:T.green}}>₴{Number(o.amount)}</div>
    </div>
    <ProgressBar value={p} color={pCol(p)} h={5}/>
    <div style={{...S.flex,justifyContent:"space-between",marginTop:6}}>
      <span style={{fontSize:10,color:T.textSec}}>{d?.joined||0}/{d?.needed||0} учасників</span>
      <Badge bg="#fef9c3" color="#a16207">{p>=100?"Група зібрана!":"Чекає на групу"}</Badge>
    </div>

    {showQR&&qrToken&&<div style={{marginTop:12,textAlign:"center",background:T.greenLight,borderRadius:12,padding:16}}>
      <div style={{background:"#fff",borderRadius:12,padding:12,display:"inline-block",marginBottom:10}}><QRCode value={qrToken} size={160}/></div>
      <div style={{...S.flex,justifyContent:"center",gap:6,marginBottom:4}}>
        <span style={{fontSize:12,fontWeight:900,color:T.text,letterSpacing:1}}>{shortCode}</span>
        <button onClick={()=>{navigator.clipboard.writeText(qrToken);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{...S.btn,background:"transparent",color:copied?T.green:T.textMuted,padding:2}}>{copied?I.check:I.copy}</button>
      </div>
      <div style={{fontSize:9,color:T.textMuted}}>Покажіть продавцю або надішліть код</div>
      <button onClick={()=>{const t=`Spil: ${d?.title} — ${qrToken}`;if(navigator.share)navigator.share({title:"Spil QR",text:t});else{navigator.clipboard.writeText(qrToken);alert("Код скопійовано!");}}}
        style={{...S.btn,marginTop:8,padding:"8px 16px",borderRadius:10,background:T.cardAlt,color:T.text,fontSize:10,...S.flex,gap:4,justifyContent:"center"}}>{I.share} Надіслати код</button>
    </div>}

    <button onClick={loadQR} disabled={qrLoading} style={{...S.btn,width:"100%",marginTop:10,padding:12,borderRadius:10,background:showQR?T.cardAlt:T.accent,color:showQR?T.text:"#fff",fontSize:12}}>
      {qrLoading?"Завантаження...":(showQR?"Сховати QR":"Показати QR код")}
    </button>
  </div>;
}

const dashCache={data:null,loaded:false};
function SellerDashboard({ deals, joined, onOpen, onBuy }) {
  const [subTab,setSubTab]=useState("biz");
  const [myOrders,setMyOrders]=useState(dashCache.data?.my||[]);
  const [sellerOrders,setSellerOrders]=useState(dashCache.data?.seller||[]);
  const [sellerDeals,setSellerDeals]=useState(dashCache.data?.deals||[]);
  const [loading,setLoading]=useState(!dashCache.loaded);
  const userId=(() => { try { return JSON.parse(localStorage.getItem("spilnokup_user"))?.id; } catch { return null; } })();
  const userName=(() => { try { return JSON.parse(localStorage.getItem("spilnokup_user"))?.name; } catch { return ""; } })();

  const loadAll=useCallback(()=>{
    return Promise.all([
      fetchMyOrders().catch(()=>[]),
      fetchSellerOrders().catch(()=>[]),
      fetchSellerDeals().catch(()=>[]),
    ]).then(([my,seller,deals])=>{
      setMyOrders(my);setSellerOrders(seller);setSellerDeals(deals);
      dashCache.data={my,seller,deals};dashCache.loaded=true;
    });
  },[]);

  useEffect(()=>{
    if(!isLoggedIn()){setLoading(false);return;}
    loadAll().finally(()=>setLoading(false));
    // WebSocket updates — all changes refresh instantly
    const unsub1=onEvent('deal:update',()=>loadAll());
    const unsub2=onEvent('order:completed',()=>loadAll());
    const unsub3=onEvent('deal:new',()=>loadAll());
    const unsub4=onEvent('deal:deleted',()=>loadAll());
    return ()=>{unsub1();unsub2();unsub3();unsub4();};
  },[]);

  const actSeller=sellerOrders.filter(o=>o.status==="PAID");
  const doneSeller=sellerOrders.filter(o=>o.status==="COMPLETED");
  const totalRev=sellerOrders.reduce((s,o)=>s+Number(o.amount),0);

  const myPaid=myOrders.filter(o=>o.status==="PAID");
  const myDone=myOrders.filter(o=>o.status==="COMPLETED");

  if(loading) return <div style={S.page}><div style={{textAlign:"center",padding:40,color:T.textSec}}>Завантаження...</div></div>;

  return <div style={S.page}>
    <div style={{...S.flex,gap:0,background:T.cardAlt,borderRadius:10,padding:3,marginBottom:14}}>
      {[["biz","Мої товари"],["my","Мої покупки"]].map(([id,label])=>
        <button key={id} onClick={()=>setSubTab(id)} style={{...S.btn,flex:1,padding:"8px 0",borderRadius:8,fontSize:11,background:subTab===id?T.card:"transparent",color:subTab===id?T.text:T.textMuted}}>{label}</button>
      )}
    </div>

    {subTab==="my"?<>
      <h2 style={{color:T.text,fontSize:18,fontWeight:900,marginBottom:4}}>Мої покупки</h2>
      <p style={{color:T.textSec,fontSize:11,marginBottom:14}}>{myOrders.length} замовлень</p>

      {myOrders.length===0?<div style={{textAlign:"center",padding:50}}><div style={{fontSize:44}}>🛒</div><div style={{color:T.textMuted,marginTop:10,fontSize:12}}>Ще нічого не купували</div><div style={{color:T.textMuted,fontSize:10,marginTop:4}}>Долучіться до покупки в Маркеті</div></div>:
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {myPaid.length>0&&<><h3 style={{fontSize:13,fontWeight:800,color:T.text}}>Очікують ({myPaid.length})</h3>
        {myPaid.map(o=><MyOrderCard key={o.id} order={o} onRefresh={loadAll}/>)}</>}

        {myDone.length>0&&<><h3 style={{fontSize:13,fontWeight:800,color:T.text,marginTop:8}}>Отримані ({myDone.length})</h3>
        {myDone.map(o=><div key={o.id} style={{...S.card,opacity:.6}}>
          <div style={{...S.flex,gap:10}}>
            <Ic emoji="✅" size={32}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>{o.deal?.title||"Товар"}</div><div style={{fontSize:10,color:T.textSec}}>{o.quantity} {o.deal?.unit||"шт"}</div></div>
            <Badge>Отримано</Badge>
          </div>
        </div>)}</>}
      </div>}
    </>:<>

    <h2 style={{color:T.text,fontSize:18,fontWeight:900,marginBottom:4}}>Мої товари</h2>

    {sellerDeals.length>0&&<div style={{ background:`linear-gradient(135deg,${T.greenLight},${T.greenBorder})`,borderRadius:T.radius,padding:16,marginBottom:14 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4 }}>
        {[[`₴${totalRev}`,"Дохід"],[`${actSeller.length}`,"Очікують"],[`${doneSeller.length}`,"Видані"],[`${sellerDeals.length}`,"Товарів"]].map(([v,l],i)=>
          <div key={i} style={{ background:"rgba(255,255,255,.7)",borderRadius:T.radiusSm,padding:8,textAlign:"center" }}><div style={{ fontSize:13,fontWeight:900,color:T.green }}>{v}</div><div style={{ fontSize:8,color:T.textSec }}>{l}</div></div>
        )}
      </div>
    </div>}

    {sellerDeals.length===0?<div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:44}}>📦</div>
      <div style={{color:T.textMuted,marginTop:10,fontSize:12}}>У вас ще немає товарів</div>
      <div style={{color:T.textMuted,fontSize:10,marginTop:4}}>Створіть оголошення в Маркеті (кнопка +)</div>
    </div>:<>

    <h3 style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:8}}>Мої оголошення ({sellerDeals.length})</h3>
    {sellerDeals.map(d=>{const p=Math.min(100,Math.round((d.joined/d.needed)*100));return <div key={d.id} style={{...S.card,marginBottom:8}}>
      <div style={{...S.flex,gap:10,marginBottom:6}}>
        <Ic emoji="📦" size={36}/>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:800,color:T.text}}>{d.title}</div><div style={{fontSize:10,color:T.textSec}}>₴{Number(d.groupPrice)} · {d.city}</div></div>
        <Badge bg={d.status==="ACTIVE"?T.greenLight:T.cardAlt} color={d.status==="ACTIVE"?T.green:T.textMuted}>{d.status==="ACTIVE"?"Активне":"Закрите"}</Badge>
      </div>
      <ProgressBar value={p} color={pCol(p)} h={5}/>
      <div style={{...S.flex,justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:T.textSec}}>{d.joined}/{d.needed} учасників</span><span style={{fontSize:10,fontWeight:700,color:pCol(p)}}>{p}%</span></div>
      <div style={{...S.flex,justifyContent:"space-between",marginTop:6}}>
        {d._count?.orders>0&&<div style={{fontSize:10,color:T.accent,fontWeight:700}}>{d._count.orders} замовлень</div>}
        <button onClick={async(e)=>{e.stopPropagation();if(!confirm(`Видалити "${d.title}"?`))return;try{await deleteDeal(d.id);setSellerDeals(prev=>prev.filter(x=>x.id!==d.id));}catch(ex){alert(ex.message);}}} style={{...S.btn,padding:"4px 10px",borderRadius:8,background:"#ef444418",color:"#ef4444",fontSize:10}}>Видалити</button>
      </div>
    </div>;})}

    {actSeller.length>0&&<>
    <h3 style={{fontSize:13,fontWeight:800,color:T.text,margin:"14px 0 8px"}}>Нові замовлення ({actSeller.length})</h3>
    {actSeller.map(o=><div key={o.id} style={{...S.card,...S.flex,gap:10,marginBottom:8}}>
      <Ic emoji="👤" size={36}/>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:T.text}}>{o.buyer?.name||"Покупець"}</div>
        <div style={{fontSize:10,color:T.textSec}}>{o.deal?.title} × {o.quantity} {o.deal?.unit}</div>
      </div>
      <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:T.green}}>₴{Number(o.amount)}</div><Badge bg="#fef9c3" color="#a16207">Оплачено</Badge></div>
    </div>)}</>}

    {doneSeller.length>0&&<>
    <h3 style={{fontSize:13,fontWeight:800,color:T.text,margin:"14px 0 8px"}}>Видані ({doneSeller.length})</h3>
    {doneSeller.map(o=><div key={o.id} style={{...S.card,...S.flex,gap:10,marginBottom:8,opacity:.55}}>
      <Ic emoji="✅" size={32}/>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T.text}}>{o.buyer?.name||"Покупець"}</div><div style={{fontSize:10,color:T.textSec}}>{o.deal?.title}</div></div>
      <Badge>Видано</Badge>
    </div>)}</>}

    </>}
    </>}
  </div>;
}

// ── Гаманець + Профіль ──────────────────────────────────────────────────────
function WalletPage({ user, setUser, theme, onTheme }) {
  const [editing,setEditing]=useState(false),[eName,setEName]=useState(user?.name||""),[eEmail,setEEmail]=useState(user?.email||""),[ePhone,setEPhone]=useState(user?.phone||""),[eCity,setECity]=useState(user?.city||"");
  const [balance,setBalance]=useState(0);
  const [walletData,setWalletData]=useState(null);
  const [showPay,setShowPay]=useState(null); // "topup" | "withdraw"
  const [payMethod,setPayMethod]=useState(null);
  const [payAmount,setPayAmount]=useState("");
  const [payDone,setPayDone]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("register"); // "register" | "login"
  const [authPhone,setAuthPhone]=useState(""),[authCode,setAuthCode]=useState(""),[authName,setAuthName]=useState(""),[authCity,setAuthCity]=useState("");
  const [authStep,setAuthStep]=useState(0); // register: 0=name+phone, 1=city, 2=telegram, 3=otp  |  login: 0=phone, 1=telegram, 2=otp
  const [authLoading,setAuthLoading]=useState(false),[authError,setAuthError]=useState("");
  const [authTgToken,setAuthTgToken]=useState("");
  const [showSettings,setShowSettings]=useState(false);
  const [showSupport,setShowSupport]=useState(false);
  const [supportMsg,setSupportMsg]=useState("");
  const [supportSent,setSupportSent]=useState(false);
  const [supportLoading,setSupportLoading]=useState(false);
  const txIcons={income:"↓",withdrawal:"↑",hold:"◷"}, txColors={income:T.green,withdrawal:T.orange,hold:T.yellow};
  const isGuest=!user||user.name==="Гість"||!localStorage.getItem("spilnokup_token");

  // Load real wallet balance
  useEffect(()=>{
    if(isGuest||!isLoggedIn()) return;
    let active=true;
    const load=()=>{
      fetchWallet().then(w=>{
        if(active&&w){setBalance(Number(w.availableBalance)||0);setWalletData(w);}
      }).catch(()=>{});
    };
    load();
    const unsub=onEvent('wallet:update',load);
    return ()=>{active=false;unsub();};
  },[user]);
  const initials=(user?.name||"Г").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  const doAuthSendOtp=async(nextStep)=>{
    setAuthLoading(true);setAuthError("");
    try{
      const res=await sendOtp(authPhone);
      if(res.telegramToken) setAuthTgToken(res.telegramToken);
      setAuthStep(nextStep||2);
    }catch(e){setAuthError(e.message);}
    finally{setAuthLoading(false);}
  };
  const openAuthTelegram=()=>{
    if(authTgToken) window.open(`https://t.me/spilnokupbot?start=${authTgToken}`,"_blank");
    else window.open("https://t.me/spilnokupbot","_blank");
  };
  const doAuthVerify=async()=>{
    setAuthLoading(true);setAuthError("");
    try{
      const data=await verifyOtp(authPhone,authCode,authName,authCity,authMode);
      const u=data.user;
      localStorage.setItem("spilnokup_user",JSON.stringify(u));
      setUser(u);setShowAuth(false);setAuthStep(0);reconnectWithAuth();
    }catch(e){setAuthError(e.message);}
    finally{setAuthLoading(false);}
  };
  const doLogout=()=>{disconnectSocket();apiLogout();const g={name:"Гість",email:"",phone:"",city:""};localStorage.setItem("spilnokup_user",JSON.stringify(g));setUser(g);};

  const payMethods=[
    {id:"card",name:"Картка",icon:"💳",desc:"Visa / Mastercard"},
    {id:"apple",name:"Apple Pay",icon:"",desc:"Миттєво"},
    {id:"crypto",name:"Крипто",icon:"₿",desc:"BTC, ETH, USDT"},
  ];

  const doPay=()=>{
    const amt=parseInt(payAmount);
    if(!amt||amt<=0) return;
    if(showPay==="topup") setBalance(b=>b+amt);
    else setBalance(b=>Math.max(0,b-amt));
    setPayDone(true);
    setTimeout(()=>{setShowPay(null);setPayMethod(null);setPayAmount("");setPayDone(false);},2000);
  };

  if(!S||!T) return <div style={{padding:20,color:"#fff"}}>Завантаження...</div>;

  if(showPay) return <div style={S.page}>
    <BackBtn onClick={()=>{setShowPay(null);setPayMethod(null);setPayAmount("");setPayDone(false);}}/>
    {payDone?<div style={{ ...S.card,textAlign:"center",padding:30 }}>
      <div style={{ fontSize:48,marginBottom:10 }}>✅</div>
      <div style={{ fontSize:18,fontWeight:900,color:T.green }}>{showPay==="topup"?"Поповнено":"Виведено"}!</div>
      <div style={{ fontSize:24,fontWeight:900,color:T.text,marginTop:8 }}>₴{payAmount}</div>
    </div>:!payMethod?<>
      <h2 style={{ fontSize:18,fontWeight:900,color:T.text,marginBottom:4 }}>{showPay==="topup"?"Поповнення":"Виведення"}</h2>
      <p style={{ fontSize:12,color:T.textSec,marginBottom:16 }}>Оберіть спосіб</p>
      {payMethods.map(m=><div key={m.id} onClick={()=>setPayMethod(m.id)} style={{ ...S.card,...S.flex,gap:12,marginBottom:8,cursor:"pointer",padding:16 }}>
        <div style={{ fontSize:24,width:44,height:44,borderRadius:12,background:T.cardAlt,...S.flex,justifyContent:"center" }}>{m.icon}</div>
        <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:800,color:T.text }}>{m.name}</div><div style={{ fontSize:11,color:T.textSec }}>{m.desc}</div></div>
      </div>)}
    </>:<>
      <h2 style={{ fontSize:18,fontWeight:900,color:T.text,marginBottom:4 }}>{showPay==="topup"?"Поповнити":"Вивести"} через {payMethods.find(m=>m.id===payMethod)?.name}</h2>
      <p style={{ fontSize:12,color:T.textSec,marginBottom:16 }}>Баланс: ₴{balance.toLocaleString()}</p>
      <Input value={payAmount} onChange={e=>setPayAmount(e.target.value.replace(/\D/g,""))} placeholder="Сума, ₴" type="text"/>
      <div style={{ display:"flex",gap:6,marginTop:10 }}>
        {[100,500,1000,5000].map(a=><button key={a} onClick={()=>setPayAmount(String(a))} style={{ ...S.btn,flex:1,padding:"8px 0",borderRadius:10,fontSize:11,background:payAmount===String(a)?T.accent:T.cardAlt,color:payAmount===String(a)?"#fff":T.textSec }}>₴{a}</button>)}
      </div>
      {payMethod==="card"&&<div style={{ ...S.card,marginTop:14 }}>
        <Input value="" onChange={()=>{}} placeholder="0000 0000 0000 0000"/>
        <div style={{ display:"flex",gap:8,marginTop:8 }}><div style={{ flex:1 }}><Input value="" onChange={()=>{}} placeholder="MM/YY"/></div><div style={{ flex:1 }}><Input value="" onChange={()=>{}} placeholder="CVV" type="password"/></div></div>
      </div>}
      {payMethod==="crypto"&&<div style={{ ...S.card,marginTop:14,textAlign:"center" }}>
        <div style={{ fontSize:11,color:T.textSec,marginBottom:6 }}>Адреса гаманця</div>
        <div style={{ fontSize:10,fontWeight:700,color:T.text,wordBreak:"break-all",background:T.cardAlt,padding:10,borderRadius:8 }}>0x7a3b...f91e2d4c8</div>
        <div style={{ ...S.flex,justifyContent:"center",gap:12,marginTop:10 }}>
          {["BTC","ETH","USDT"].map(c=><span key={c} style={{ fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:6,background:T.cardAlt,color:T.textSec }}>{c}</span>)}
        </div>
      </div>}
      {payMethod==="apple"&&<div style={{ ...S.card,marginTop:14,textAlign:"center",padding:20 }}>
        <div style={{ fontSize:36,marginBottom:8 }}></div>
        <div style={{ fontSize:12,color:T.textSec }}>Натисніть для підтвердження через Apple Pay</div>
      </div>}
      <button onClick={doPay} disabled={!payAmount} style={{ ...S.btn,width:"100%",padding:14,background:payAmount?T.accent:T.cardAlt,color:payAmount?"#fff":T.textMuted,borderRadius:14,fontSize:15,marginTop:16 }}>
        {showPay==="topup"?"Поповнити":"Вивести"} {payAmount?`₴${parseInt(payAmount).toLocaleString()}`:""}
      </button>
    </>}
  </div>;

  // Auth form in wallet
  if(showAuth) {
    const resetAuth=()=>{setShowAuth(false);setAuthStep(0);setAuthError("");setAuthCode("");setAuthPhone("");setAuthName("");setAuthCity("");};

    // Login mode: phone → telegram → OTP
    if(authMode==="login") return <div style={S.page}>
      <BackBtn onClick={resetAuth}/>
      {authStep===0?<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4 }}>Увійти в акаунт</h2>
        <p style={{ fontSize:12,color:T.textSec,marginBottom:20 }}>Введіть номер телефону з якого реєструвались</p>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Input value={authPhone} onChange={e=>setAuthPhone(e.target.value)} placeholder="+380XXXXXXXXX" icon={I.phone} type="tel"/>
        </div>
        {authError&&<div style={{ color:"#ef4444",fontSize:12,marginTop:10 }}>{authError}</div>}
        <button onClick={()=>doAuthSendOtp(1)} disabled={!authPhone||authLoading} style={{ ...S.btn,width:"100%",padding:14,background:authPhone?T.accent:T.cardAlt,color:authPhone?"#fff":T.textMuted,borderRadius:14,fontSize:14,marginTop:20 }}>{authLoading?"Зачекайте...":"Далі"}</button>
        <div style={{ textAlign:"center",marginTop:16 }}>
          <span style={{ fontSize:11,color:T.textSec }}>Немає акаунту? </span>
          <button onClick={()=>{setAuthMode("register");setAuthStep(0);setAuthError("");}} style={{ ...S.btn,background:"none",color:T.accent,fontSize:11,padding:0 }}>Створити</button>
        </div>
      </>:authStep===1?<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4,textAlign:"center" }}>Отримайте код</h2>
        <div style={{ fontSize:50,textAlign:"center",margin:"16px 0" }}>✈</div>
        <p style={{ fontSize:12,color:T.textSec,marginBottom:16,textAlign:"center",lineHeight:1.6 }}>Натисніть кнопку — відкриється Telegram.<br/>Натисніть <b>Start</b> — бот надішле код.</p>
        <a href={`https://t.me/spilnokupbot?start=${authTgToken}`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn,display:"block",width:"100%",padding:14,background:"#0088cc",color:"#fff",borderRadius:14,fontSize:14,marginBottom:12,textAlign:"center",textDecoration:"none",boxSizing:"border-box" }}>✈ Відкрити Telegram</a>
        <div style={{ fontSize:10,color:T.textMuted,textAlign:"center",marginBottom:16 }}>1. Натисніть Start в боті → 2. Отримайте код → 3. Введіть нижче</div>
        <button onClick={()=>setAuthStep(2)} style={{ ...S.btn,width:"100%",padding:14,background:T.accent,color:"#fff",borderRadius:14,fontSize:14 }}>Я отримав код</button>
      </>:<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4 }}>Код підтвердження</h2>
        <div style={{ ...S.card,background:T.greenLight,textAlign:"center",marginBottom:16,...S.flex,justifyContent:"center",gap:6 }}><span style={{fontSize:16}}>✈️</span><span style={{ fontSize:12,color:T.green }}>Код надіслано в Telegram</span></div>
        <div style={{ ...S.flex,justifyContent:"center",gap:8,marginBottom:20 }}>
          {[0,1,2,3,4,5].map(i=><input key={i} maxLength={1} inputMode="numeric" pattern="[0-9]*" value={authCode[i]||""} onChange={e=>{const v=e.target.value.replace(/\D/g,"");const nc=authCode.split("");nc[i]=v;setAuthCode(nc.join(""));if(v&&i<5)e.target.nextSibling?.focus();}} onKeyDown={e=>{if(e.key==="Backspace"&&!authCode[i]&&i>0){const nc=authCode.split("");nc[i-1]="";setAuthCode(nc.join(""));e.target.previousSibling?.focus();}}}
            style={{ width:46,height:54,textAlign:"center",fontSize:24,fontWeight:900,border:`2px solid ${authCode[i]?T.accent:T.border}`,borderRadius:12,outline:"none",color:T.text,fontFamily:"inherit",background:T.card }}/>)}
        </div>
        {authError&&<div style={{ color:"#ef4444",fontSize:12,marginBottom:8,textAlign:"center" }}>{authError}</div>}
        <button onClick={doAuthVerify} disabled={authCode.length<6||authLoading}
          style={{ ...S.btn,width:"100%",padding:14,background:authCode.length>=6?T.accent:T.cardAlt,color:authCode.length>=6?"#fff":T.textMuted,borderRadius:14,fontSize:14 }}>{authLoading?"Перевіряємо...":"Увійти"}</button>
      </>}
    </div>;

    // Register mode: name+phone → city → OTP
    return <div style={S.page}>
      <BackBtn onClick={resetAuth}/>
      {authStep===0?<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4 }}>Створити акаунт</h2>
        <p style={{ fontSize:12,color:T.textSec,marginBottom:20 }}>Введіть дані для реєстрації</p>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Ваше ім'я" icon={I.user}/>
          <Input value={authPhone} onChange={e=>setAuthPhone(e.target.value)} placeholder="+380XXXXXXXXX" icon={I.phone} type="tel"/>
        </div>
        {authError&&<div style={{ color:"#ef4444",fontSize:12,marginTop:10 }}>{authError}</div>}
        <button onClick={()=>setAuthStep(1)} disabled={!authName||!authPhone} style={{ ...S.btn,width:"100%",padding:14,background:(authName&&authPhone)?T.accent:T.cardAlt,color:(authName&&authPhone)?"#fff":T.textMuted,borderRadius:14,fontSize:14,marginTop:20 }}>Далі</button>
        <div style={{ textAlign:"center",marginTop:16 }}>
          <span style={{ fontSize:11,color:T.textSec }}>Вже є акаунт? </span>
          <button onClick={()=>{setAuthMode("login");setAuthStep(0);setAuthError("");}} style={{ ...S.btn,background:"none",color:T.accent,fontSize:11,padding:0 }}>Увійти</button>
        </div>
      </>:authStep===1?<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4 }}>Ваше місто</h2>
        <p style={{ fontSize:12,color:T.textSec,marginBottom:20 }}>Оберіть або введіть місто</p>
        <Input value={authCity} onChange={e=>setAuthCity(e.target.value)} placeholder="Місто"/>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:14 }}>
          {["Київ","Харків","Одеса","Дніпро","Львів","Бориспіль","Бровари","Черкаси"].map(c=>
            <button key={c} onClick={()=>setAuthCity(c)} style={{ ...S.btn,padding:"7px 12px",borderRadius:10,fontSize:11,background:authCity===c?T.accent:T.cardAlt,color:authCity===c?"#fff":T.textSec }}>{c}</button>
          )}
        </div>
        {authError&&<div style={{ color:"#ef4444",fontSize:12,marginTop:10 }}>{authError}</div>}
        <button onClick={()=>doAuthSendOtp(2)} disabled={!authCity||authLoading} style={{ ...S.btn,width:"100%",padding:14,background:authCity?T.accent:T.cardAlt,color:authCity?"#fff":T.textMuted,borderRadius:14,fontSize:14,marginTop:20 }}>{authLoading?"Зачекайте...":"Далі"}</button>
      </>:authStep===2?<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4,textAlign:"center" }}>Отримайте код</h2>
        <div style={{ fontSize:50,textAlign:"center",margin:"16px 0" }}>✈</div>
        <p style={{ fontSize:12,color:T.textSec,marginBottom:16,textAlign:"center",lineHeight:1.6 }}>Натисніть кнопку — відкриється Telegram.<br/>Натисніть <b>Start</b> — бот надішле код.</p>
        <a href={`https://t.me/spilnokupbot?start=${authTgToken}`} target="_blank" rel="noopener noreferrer" style={{ ...S.btn,display:"block",width:"100%",padding:14,background:"#0088cc",color:"#fff",borderRadius:14,fontSize:14,marginBottom:12,textAlign:"center",textDecoration:"none",boxSizing:"border-box" }}>✈ Відкрити Telegram</a>
        <div style={{ fontSize:10,color:T.textMuted,textAlign:"center",marginBottom:16 }}>1. Натисніть Start → 2. Отримайте код → 3. Введіть нижче</div>
        <button onClick={()=>setAuthStep(3)} style={{ ...S.btn,width:"100%",padding:14,background:T.accent,color:"#fff",borderRadius:14,fontSize:14 }}>Я отримав код</button>
      </>:<>
        <h2 style={{ fontSize:20,fontWeight:900,color:T.text,marginBottom:4 }}>Код підтвердження</h2>
        <div style={{ ...S.card,background:T.greenLight,textAlign:"center",marginBottom:16,...S.flex,justifyContent:"center",gap:6 }}><span style={{fontSize:16}}>✈️</span><span style={{ fontSize:12,color:T.green }}>Код надіслано в Telegram</span></div>
        <div style={{ ...S.flex,justifyContent:"center",gap:8,marginBottom:20 }}>
          {[0,1,2,3,4,5].map(i=><input key={i} maxLength={1} inputMode="numeric" pattern="[0-9]*" value={authCode[i]||""} onChange={e=>{const v=e.target.value.replace(/\D/g,"");const nc=authCode.split("");nc[i]=v;setAuthCode(nc.join(""));if(v&&i<5)e.target.nextSibling?.focus();}} onKeyDown={e=>{if(e.key==="Backspace"&&!authCode[i]&&i>0){const nc=authCode.split("");nc[i-1]="";setAuthCode(nc.join(""));e.target.previousSibling?.focus();}}}
            style={{ width:46,height:54,textAlign:"center",fontSize:24,fontWeight:900,border:`2px solid ${authCode[i]?T.accent:T.border}`,borderRadius:12,outline:"none",color:T.text,fontFamily:"inherit",background:T.card }}/>)}
        </div>
        {authError&&<div style={{ color:"#ef4444",fontSize:12,marginBottom:8,textAlign:"center" }}>{authError}</div>}
        <button onClick={doAuthVerify} disabled={authCode.length<6||authLoading}
          style={{ ...S.btn,width:"100%",padding:14,background:authCode.length>=6?T.accent:T.cardAlt,color:authCode.length>=6?"#fff":T.textMuted,borderRadius:14,fontSize:14 }}>{authLoading?"Перевіряємо...":"Підтвердити"}</button>
      </>}
    </div>;
  }

  if(showSupport) return <div style={S.page}>
    <BackBtn onClick={()=>{setShowSupport(false);setSupportSent(false);setSupportMsg("");}}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:4 }}>Підтримка</h2>
    <p style={{ fontSize:12,color:T.textSec,marginBottom:16 }}>Опишіть вашу проблему або запитання</p>
    {supportSent?<div style={{ ...S.card,textAlign:"center",padding:30 }}>
      <div style={{ fontSize:48,marginBottom:12 }}>✅</div>
      <div style={{ fontSize:16,fontWeight:800,color:T.text,marginBottom:6 }}>Повідомлення надіслано!</div>
      <div style={{ fontSize:12,color:T.textSec,lineHeight:1.6 }}>Відповідь прийде у вкладку <b>Чат</b> → <b>Підтримка</b></div>
      <button onClick={()=>{setSupportSent(false);setSupportMsg("");}} style={{ ...S.btn,marginTop:16,padding:"10px 20px",borderRadius:12,background:T.accent,color:"#fff",fontSize:13 }}>Написати ще</button>
    </div>:<>
      <textarea value={supportMsg} onChange={e=>setSupportMsg(e.target.value)} placeholder="Напишіть ваше повідомлення..." rows={5}
        style={{ width:"100%",padding:14,borderRadius:14,border:`1px solid ${T.border}`,background:T.card,color:T.text,fontSize:14,fontFamily:"inherit",resize:"vertical",outline:"none" }}/>
      <button onClick={async()=>{
        if(!supportMsg.trim()) return;
        setSupportLoading(true);
        try{
          const token=localStorage.getItem("spilnokup_token");
          await fetch(`${API}/telegram/support`,{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
            body:JSON.stringify({message:supportMsg,userName:user?.name||"Гість",userPhone:user?.phone||""})});
          // Save to support chat
          const newMsg={id:Date.now(),text:supportMsg.trim(),from:"me",time:new Date().toISOString()};
          const prev=JSON.parse(localStorage.getItem("spilnokup_support_msgs")||"[]");
          localStorage.setItem("spilnokup_support_msgs",JSON.stringify([...prev,newMsg]));
          setSupportSent(true);
        }catch(e){}
        setSupportLoading(false);
      }} disabled={!supportMsg.trim()||supportLoading}
        style={{ ...S.btn,width:"100%",padding:14,borderRadius:14,background:supportMsg.trim()?T.accent:T.cardAlt,color:supportMsg.trim()?"#fff":T.textMuted,fontSize:14,marginTop:12 }}>
        {supportLoading?"Надсилаємо...":"Надіслати"}
      </button>
    </>}
  </div>;

  if(showSettings) return <div style={S.page}>
    <BackBtn onClick={()=>setShowSettings(false)}/>
    <h2 style={{ fontSize:22,fontWeight:900,color:T.text,marginBottom:16 }}>Налаштування</h2>
    <div style={{ ...S.card,marginBottom:12 }}>
      <div style={{ fontSize:13,fontWeight:700,color:T.text,marginBottom:10 }}>Стиль додатку</div>
      <ThemeSwitcher current={theme} onChange={onTheme}/>
    </div>
    <div onClick={()=>setShowSupport(true)} style={{ ...S.card,...S.flex,gap:12,cursor:"pointer",marginBottom:12 }}>
      <div style={{ fontSize:22 }}>💬</div>
      <div>
        <div style={{ fontSize:13,fontWeight:700,color:T.text }}>Підтримка</div>
        <div style={{ fontSize:11,color:T.textSec }}>Зв'язатись з командою</div>
      </div>
    </div>
  </div>;

  return <div style={S.page}>
    <div style={{ position:"relative" }}>
      <button onClick={()=>setShowSettings(true)} style={{ ...S.btn,position:"absolute",top:12,right:12,zIndex:10,width:36,height:36,borderRadius:12,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",...S.flex,justifyContent:"center" }}>
        <svg width="18" height="18" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      </button>
    </div>
    <div style={{ ...S.card,marginBottom:16,textAlign:"center",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:80,background:`linear-gradient(135deg,${T.accent},${T.purple},${T.blue})` }}/>
      <div style={{ position:"relative",paddingTop:40 }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${T.greenLight},#e0e7ff)`,border:"3px solid #fff",margin:"0 auto 10px",...S.flex,justifyContent:"center",fontSize:24,fontWeight:900,color:T.green,boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          {initials}
        </div>
        <div style={{ fontSize:18,fontWeight:900,color:T.text }}>{user?.name||"Гість"}</div>
        {user?.displayId&&<div style={{ fontSize:10,color:T.accent,fontWeight:700,marginTop:2 }}>ID: {user.displayId}</div>}
        <div style={{ fontSize:11,color:T.textSec,marginTop:2 }}>{user?.city||"Не вказано"}</div>
        <div style={{ ...S.flex,gap:8,justifyContent:"center",marginTop:10 }}>
          {isGuest?<div style={{...S.flex,gap:8}}>
            <button onClick={()=>{setShowAuth(true);setAuthMode("register");}} style={{ ...S.btn,...S.flex,gap:4,padding:"8px 14px",borderRadius:10,background:T.accent,color:"#fff",fontSize:11 }}>{I.user} Створити</button>
            <button onClick={()=>{setShowAuth(true);setAuthMode("login");}} style={{ ...S.btn,...S.flex,gap:4,padding:"8px 14px",borderRadius:10,background:T.cardAlt,color:T.text,fontSize:11,border:`1px solid ${T.border}44` }}>{I.lock} Увійти</button>
          </div>
          :<><button onClick={()=>setEditing(!editing)} style={{ ...S.btn,...S.flex,gap:4,padding:"6px 14px",borderRadius:10,background:T.cardAlt,color:T.textSec,fontSize:11 }}>{I.edit} {editing?"Закрити":"Редагувати"}</button>
            <button onClick={doLogout} style={{ ...S.btn,padding:"6px 14px",borderRadius:10,background:T.cardAlt,color:T.orange,fontSize:11 }}>Вийти</button></>}
        </div>
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
      <div style={{ fontSize:32,fontWeight:900,color:T.text }}>₴{balance.toLocaleString()}</div>
      {walletData&&Number(walletData.heldBalance)>0&&<div style={{ fontSize:11,color:T.yellow,marginTop:2 }}>Заморожено: ₴{Number(walletData.heldBalance).toLocaleString()}</div>}
      <div style={{ display:"flex",gap:8,marginTop:12,justifyContent:"center" }}>
        <button onClick={()=>setShowPay("topup")} style={{ ...S.btn,padding:"10px 20px",borderRadius:12,fontSize:12,background:T.accent,color:"#fff" }}>+ Поповнити</button>
        <button onClick={()=>setShowPay("withdraw")} style={{ ...S.btn,padding:"10px 20px",borderRadius:12,fontSize:12,background:T.cardAlt,color:T.text,border:`1px solid ${T.border}44` }}>Вивести</button>
      </div>
    </div>

    <h3 style={{ color:T.text,fontSize:14,fontWeight:800,marginBottom:10 }}>Історія транзакцій</h3>
    {(walletData?.transactions||[]).length>0?(walletData.transactions||[]).map((t,idx)=>{
      try{
        const isIncome=t.type==='PAYMENT_RELEASE';
        const isHold=t.type==='PAYMENT_HOLD'&&(t.description||'').startsWith('Очікує');
        const icon=isIncome?"↓":isHold?"◷":"↑";
        const color=isIncome?T.green:isHold?T.yellow:T.orange;
        const sign=isIncome?"+":"−";
        const d=t.createdAt?new Date(t.createdAt):new Date();
        const ds=`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        return <div key={t.id||idx} style={{...S.card,...S.flex,gap:10,marginBottom:8}}>
          <div style={{width:36,height:36,borderRadius:10,background:color+"18",...S.flex,justifyContent:"center",fontSize:16,fontWeight:900,color}}>{icon}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>{t.description||t.type||"Транзакція"}</div><div style={{fontSize:10,color:T.textSec}}>{ds}</div></div>
          <div style={{fontSize:14,fontWeight:800,color}}>{sign}₴{Number(t.amount)||0}</div>
        </div>;
      }catch{return null;}
    }):<div style={{...S.card,textAlign:"center",padding:20}}><div style={{fontSize:12,color:T.textMuted}}>Поки немає транзакцій</div></div>}

    <div style={{ ...S.card,marginTop:14 }}>
      <h3 style={{ color:T.text,fontSize:14,fontWeight:800,marginBottom:10 }}>ФОП</h3>
      {[["Назва",SELLER.fop],["ІПН",SELLER.ipn],["IBAN",SELLER.iban],["Банк",SELLER.bank]].map(([k,v])=>
        <div key={k} style={{ ...S.flex,justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}22` }}><span style={{ fontSize:11,color:T.textSec }}>{k}</span><span style={{ fontSize:11,fontWeight:700,color:T.text,textAlign:"right",maxWidth:"60%",wordBreak:"break-all" }}>{v}</span></div>
      )}
    </div>
  </div>;
}

// ── App ─────────────────────────────────────────────────────────────────────
import React from "react";
class ErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={error:null};}
  static getDerivedStateFromError(e){return{error:e};}
  render(){if(this.state.error)return <div style={{padding:20,color:"#ef4444",background:"#111",minHeight:"100vh"}}><h2>Помилка</h2><pre style={{fontSize:10,whiteSpace:"pre-wrap"}}>{this.state.error?.message||"Unknown"}</pre><button onClick={()=>{this.setState({error:null});window.location.reload();}} style={{marginTop:10,padding:"10px 20px",background:"#3d8c5c",color:"#fff",border:"none",borderRadius:10}}>Перезавантажити</button></div>;return this.props.children;}
}

function AppInner() {
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("spilnokup_user"));}catch{return null;}});
  const [authStep,setAuthStep]=useState(user?null:"welcome");
  const [tab,setTab]=useState("market"),[page,setPage]=useState(null),[joined,setJoined]=useState({}),[buyData,setBuyData]=useState(null);
  const [deals,setDeals]=useState([]);
  const [theme,setTheme]=useState(()=>localStorage.getItem("spilnokup_theme")||"ocean");
  applyTheme(theme); S=getS();
  const changeTheme=(id)=>{setTheme(id);localStorage.setItem("spilnokup_theme",id);};

  // Load deals from API
  const loadDeals=useCallback(async()=>{
    try{
      const data=await apiFetchDeals({limit:50});
      const catMap={meat:"farm",dairy:"dairy",grocery:"food",bakery:"bakery",vegetables:"veggies",services:"services",clothing:"clothing",food:"food",sport:"sport",electronics:"electronics",handmade:"handmade",beauty:"beauty",home:"home",drinks:"drinks",other:"other"};
      const mapped=data.deals.map((d,i)=>({
        id:d.id,cat:catMap[d.category]||d.category,seller:d.seller?.name||"",avatar:d.seller?.avatarUrl||"🏪",
        sellerId:d.sellerId,city:d.city||d.seller?.city||"",rating:4.8,deals:0,title:d.title,unit:d.unit,
        retail:Number(d.retailPrice),group:Number(d.groupPrice),min:d.minQty,max:d.maxQty,
        joined:d.joined,needed:d.needed,days:Math.max(0,Math.ceil((new Date(d.deadline)-Date.now())/(1000*60*60*24))),
        desc:d.description||"",tags:d.tags||[],hot:d.isHot,dbId:d.id,photo:d.images?.[0]||null,autoConfirm:d.autoConfirm||false,
      }));
      setDeals(mapped);
    }catch(e){console.warn("API unavailable, using mock data:",e.message);}
  },[]);
  useEffect(()=>{loadDeals();},[loadDeals]);

  // WebSocket — everyone gets public events, logged users get private
  useEffect(()=>{
    const unsub1=onEvent('deal:update',(data)=>{
      setDeals(prev=>prev.map(d=>d.id===data.dealId||d.dbId===data.dealId?{...d,joined:data.joined}:d));
    });
    const unsub2=onEvent('order:completed',()=>loadDeals());
    const unsub3=onEvent('deal:new',()=>loadDeals());
    const unsub4=onEvent('deal:deleted',(data)=>{
      setDeals(prev=>prev.filter(d=>d.id!==data.dealId&&d.dbId!==data.dealId));
    });
    return ()=>{unsub1();unsub2();unsub3();unsub4();};
  },[user]);

  const onJoin=id=>setJoined(j=>({...j,[id]:!j[id]}));
  const onOpen=deal=>{setPage("detail");setBuyData({deal,qty:deal.min});};
  const onBuy=(deal,qty,orderId)=>{setBuyData({deal,qty,orderId});setPage("qr");};
  const onRegDone=data=>{localStorage.setItem("spilnokup_user",JSON.stringify(data));setUser(data);setAuthStep(null);loadDeals();reconnectWithAuth();};
  const onGuest=()=>{const g={name:"Гість",email:"",phone:"",city:""};localStorage.setItem("spilnokup_user",JSON.stringify(g));setUser(g);setAuthStep(null);};

  const showNav=!page&&!authStep;
  const isMobile=typeof window!=="undefined"&&window.innerWidth<=500;

  function render() {
    if(authStep==="welcome") return <WelcomeScreen onStart={()=>setAuthStep("register")} onGuest={onGuest}/>;
    if(authStep==="register") return <RegisterScreen onDone={onRegDone}/>;
    if(page==="detail"&&buyData) return <DealDetail deal={buyData.deal} onBack={()=>setPage(null)} joined={joined} onJoin={onJoin} onBuy={onBuy} onRefresh={loadDeals} onChat={async(sellerId,dealId)=>{
      try{const conv=await createConversation(sellerId,dealId);setPage(null);setTab("chat");}catch(e){alert(e.message);}
    }}/>;
    if(page==="qr"&&buyData) return <BuyerQRPage deal={buyData.deal} qty={buyData.qty} orderId={buyData.orderId} onBack={()=>setPage(null)}/>;
    if(page==="createDeal") return <CreateDealPage onBack={()=>setPage(null)} onSave={()=>{loadDeals();setPage(null);}}/>;
    switch(tab){
      case"market":return <MarketPage deals={deals} joined={joined} onJoin={onJoin} onOpen={onOpen} user={user} onCreateDeal={()=>setPage("createDeal")} theme={theme} onTheme={changeTheme} onRefresh={loadDeals}/>;
      case"qr":return <QRHub/>;
      case"chat":return <ChatPage/>;
      case"seller":return <SellerDashboard deals={deals} joined={joined} onOpen={onOpen} onBuy={onBuy}/>;
      case"wallet":return <WalletPage user={user} setUser={setUser} theme={theme} onTheme={changeTheme}/>;
      default:return null;
    }
  }

  return <div style={{ minHeight:"100vh",background:T.bg,display:"flex",justifyContent:"center",alignItems:isMobile?"stretch":"flex-start",padding:isMobile?0:"20px 0",fontFamily:"'Inter',system-ui,sans-serif",transition:"background .3s" }}>
    <div style={{ width:isMobile?"100%":390,height:isMobile?"100vh":820,background:T.card,borderRadius:isMobile?0:44,overflow:"hidden",boxShadow:isMobile?"none":"0 20px 60px rgba(0,0,0,0.08)",position:"relative",transition:"background .3s" }}>
      <BgDecor/>
      <div style={{ position:"relative",zIndex:1,height:showNav?"calc(100% - 72px)":"100%",overflowY:"auto" }}>{render()}</div>
      {showNav&&<Nav tab={tab} setTab={setTab}/>}
    </div>
  </div>;
}

export default function App(){return <ErrorBoundary><AppInner/></ErrorBoundary>;}
