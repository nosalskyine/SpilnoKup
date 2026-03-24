import { useState, useEffect } from "react";

// ── ДАНІ ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Всі", icon: "🏪" },
  { id: "farm", label: "Ферма", icon: "🐔" },
  { id: "honey", label: "Мед", icon: "🍯" },
  { id: "veggies", label: "Городина", icon: "🥬" },
  { id: "dairy", label: "Молочне", icon: "🥛" },
  { id: "food", label: "Випічка", icon: "🍞" },
  { id: "handmade", label: "Handmade", icon: "🧵" },
  { id: "cafe", label: "Кафе", icon: "☕" },
];

const DEALS = [
  { id: 1, cat: "farm", seller: "Ферма Петренків", avatar: "🌾", city: "Бориспіль", rating: 4.9, deals: 34,
    title: "Курчата бройлер живою вагою", unit: "кг", retail: 95, group: 68, min: 2, max: 10,
    joined: 18, needed: 30, days: 3, desc: "Вирощені без антибіотиків. Природний корм. Забій в день доставки.",
    tags: ["🌿 Без антибіотиків", "🚗 Доставка Київ", "📦 від 2 кг"], hot: true },
  { id: 2, cat: "honey", seller: "Пасіка Коваля", avatar: "🐝", city: "Черкаси", rating: 5.0, deals: 67,
    title: "Акацієвий мед з пасіки", unit: "банка 1л", retail: 380, group: 260, min: 1, max: 5,
    joined: 22, needed: 25, days: 1, desc: "Качаємо в серпні. Світлий, рідкий. Сертифікат якості є.",
    tags: ["🏆 Сертифікат", "🌸 Акація 2024", "🚚 Нова Пошта"], hot: true },
  { id: 3, cat: "food", seller: "Пекарня Оленки", avatar: "👩‍🍳", city: "Київ, Поділ", rating: 4.8, deals: 89,
    title: "Набір домашньої випічки (12 шт)", unit: "набір", retail: 320, group: 210, min: 1, max: 3,
    joined: 9, needed: 15, days: 2, desc: "Круасани, булочки з маком, рогалики. Свіжа випічка щопонеділка.",
    tags: ["🔥 Щопонеділка", "🏠 Домашній рецепт", "📍 Самовивіз Поділ"], hot: false },
  { id: 4, cat: "veggies", seller: "Город дядька Миколи", avatar: "👨‍🌾", city: "Вишгород", rating: 4.7, deals: 21,
    title: "Картопля молода власного врожаю", unit: "кг", retail: 28, group: 17, min: 5, max: 50,
    joined: 41, needed: 50, days: 2, desc: "Сорт Беллароза. Без хімії. Щойно з поля.",
    tags: ["🌱 Без хімії", "🚜 Власний врожай", "📦 від 5 кг"], hot: true },
  { id: 5, cat: "dairy", seller: "Молочна від Галини", avatar: "🐄", city: "Бровари", rating: 4.9, deals: 112,
    title: "Домашній сир та сметана (набір)", unit: "набір", retail: 280, group: 195, min: 1, max: 4,
    joined: 7, needed: 20, days: 4, desc: "Сир 500г + сметана 400г. Свіже щовівторка та п'ятниця.",
    tags: ["🥛 Від однієї корови", "📅 Вт та Пт", "🚗 Доставка Бровари-Київ"], hot: false },
  { id: 6, cat: "handmade", seller: "Майстерня Тетяни", avatar: "🧶", city: "Київ, Оболонь", rating: 4.6, deals: 45,
    title: "Вишита сорочка (замовлення групою)", unit: "шт", retail: 1800, group: 1200, min: 1, max: 1,
    joined: 6, needed: 10, days: 7, desc: "Ручна вишивка. Розміри S-XL. Тканина льон.",
    tags: ["✋ Ручна робота", "👗 Розміри S-XL", "🎨 Авторська вишивка"], hot: false },
  { id: 7, cat: "cafe", seller: "Кав'ярня Зерно", avatar: "☕", city: "Київ", rating: 4.8, deals: 203,
    title: "Купон: будь-яка кава × 5", unit: "купон", retail: 175, group: 110, min: 1, max: 10,
    joined: 44, needed: 50, days: 1, desc: "Еспресо, лате, капучіно. Дійсний 60 днів.",
    tags: ["☕ Будь-яка кава", "📅 60 днів дії", "📍 вул. Саксаганського 15"], hot: true },
  { id: 8, cat: "farm", seller: "Ферма Петренків", avatar: "🌾", city: "Бориспіль", rating: 4.9, deals: 34,
    title: "Яйця домашні (лоток 30 шт)", unit: "лоток", retail: 145, group: 95, min: 1, max: 5,
    joined: 12, needed: 20, days: 3, desc: "Несучки вільного вигулу. Жовток яскраво-помаранчевий.",
    tags: ["🐔 Вільний вигул", "🟠 Яскравий жовток", "🚗 Доставка з курчатами"], hot: false },
];

const SELLER_PROFILE = {
  name: "Ферма Петренків", avatar: "🌾",
  fop: "ФОП Петренко Василь Іванович", ipn: "3456789012",
  iban: "UA213223130000026007233566001", bank: "АТ КБ «ПриватБанк»",
  group: "2 група", taxRate: "₴1,600/міс", city: "Бориспіль", rating: 4.9,
};

const TRANSACTIONS = [
  { id:"T1", type:"income", desc:"Курчата × 4кг (Олена В.)", amount:272, net:261.12, date:"24.03 · 14:22", status:"completed" },
  { id:"T2", type:"income", desc:"Яйця × 2 лотки (Микола І.)", amount:190, net:182.40, date:"24.03 · 11:05", status:"completed" },
  { id:"T3", type:"withdrawal", desc:"Виведення на IBAN", amount:3200, net:3200, date:"23.03 · 18:00", status:"completed" },
  { id:"T4", type:"hold", desc:"Очікує видачі: Курчата × 4кг", amount:272, net:261.12, date:"24.03 · 10:15", status:"hold" },
  { id:"T5", type:"tax", desc:"Нагадування: ЄП за березень", amount:1600, net:1600, date:"31.03 · дедлайн", status:"pending" },
];

const DOCUMENTS = [
  { id:"D1", type:"receipt", title:"Чек #SC-8841", desc:"Курчата 4кг · ₴272", date:"24.03.2024", buyer:"Олена Василенко", amount:272 },
  { id:"D2", type:"receipt", title:"Чек #SC-8840", desc:"Яйця 2 лотки · ₴190", date:"24.03.2024", buyer:"Микола Іваненко", amount:190 },
  { id:"D3", type:"report", title:"Звіт за березень 2024", desc:"18 угод · ₴12,840 дохід", date:"31.03.2024", buyer:null, amount:12840 },
  { id:"D4", type:"act", title:"Акт виконаних робіт", desc:"Платформа СпільноКуп · березень", date:"31.03.2024", buyer:null, amount:386.72 },
];

const INIT_ORDERS = [
  { id:"SC-8841", qr:"SC-8841|Олена|Курчата|4кг|₴272", buyer:"Олена Василенко", avatar:"👩",
    item:"Курчата бройлер", qty:4, unit:"кг", amount:272, status:"paid", phone:"+380 67 123 45 67" },
  { id:"SC-8842", qr:"SC-8842|Микола|Яйця|2 лотки|₴190", buyer:"Микола Іваненко", avatar:"👨",
    item:"Яйця домашні", qty:2, unit:"лотки", amount:190, status:"completed", phone:"+380 50 987 65 43" },
  { id:"SC-8843", qr:"SC-8843|Ірина|Курчата|6кг|₴408", buyer:"Ірина Коваль", avatar:"👩‍🦱",
    item:"Курчата бройлер", qty:6, unit:"кг", amount:408, status:"paid", phone:"+380 63 456 78 90" },
];

// ── УТИЛІТИ ───────────────────────────────────────────────────────────────────
const pct = d => Math.min(100, Math.round((d.joined / d.needed) * 100));
const disc = d => Math.round(((d.retail - d.group) / d.retail) * 100);

// ── QR SVG ────────────────────────────────────────────────────────────────────
function QRCode({ value, size = 180 }) {
  const hash = value.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const cells = 21;
  const cs = size / cells;
  function isOn(r, c) {
    if (r < 7 && c < 7) return !((r===1||r===5)&&c>=1&&c<=5) && !((c===1||c===5)&&r>=1&&r<=5) && !(r>=2&&r<=4&&c>=2&&c<=4);
    if (r < 7 && c > cells-8) return !((r===1||r===5)&&c>=cells-6&&c<=cells-2) && !((c===cells-6||c===cells-2)&&r>=1&&r<=5) && !(r>=2&&r<=4&&c>=cells-5&&c<=cells-3);
    if (r > cells-8 && c < 7) return !((r===cells-6||r===cells-2)&&c>=1&&c<=5) && !((c===1||c===5)&&r>=cells-6&&r<=cells-2) && !(r>=cells-5&&r<=cells-3&&c>=2&&c<=4);
    return (((hash ^ (r*31+c*17)) >>> 0) % 100) > 45;
  }
  return (
    <svg width={size} height={size} style={{ display:"block" }}>
      <rect width={size} height={size} fill="#fff" rx={8}/>
      {Array.from({length:cells},(_,r)=>Array.from({length:cells},(_,c)=>
        isOn(r,c)?<rect key={`${r}-${c}`} x={c*cs} y={r*cs} width={cs} height={cs} fill="#0f0f0f"/>:null
      ))}
    </svg>
  );
}

// ── ПРОГРЕС КІЛЬЦЕ ────────────────────────────────────────────────────────────
function Ring({ p, size=48, stroke=4, color }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ-(p/100)*circ} strokeLinecap="round"/>
    </svg>
  );
}

// ── НИЖНЯ НАВІГАЦІЯ ───────────────────────────────────────────────────────────
function Nav({ tab, setTab }) {
  const items = [
    ["market","🏪","Маркет"],
    ["my","🛒","Мої"],
    ["qr","📱","QR"],
    ["seller","📊","Бізнес"],
    ["wallet","💰","Гаманець"],
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:64,
      background:"#f5f5f5", borderTop:"1px solid #e0e0e0", display:"flex", zIndex:100 }}>
      {items.map(([t,icon,label])=>(
        <button key={t} onClick={()=>setTab(t)} style={{ flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:2, border:"none", background:"transparent", cursor:"pointer" }}>
          <span style={{fontSize:20}}>{icon}</span>
          <span style={{fontSize:9, fontWeight:700, color: tab===t?"#22c55e":"#444"}}>{label}</span>
          {tab===t&&<div style={{width:16,height:2,background:"#22c55e",borderRadius:1}}/>}
        </button>
      ))}
    </div>
  );
}

// ── ТАБИ ─────────────────────────────────────────────────────────────────────
function Tabs({ items, active, onChange }) {
  return (
    <div style={{display:"flex",background:"#f0f0f0",borderRadius:14,padding:4,margin:"0 16px 20px"}}>
      {items.map(([id,label])=>(
        <button key={id} onClick={()=>onChange(id)} style={{
          flex:1, padding:"9px 0", border:"none", borderRadius:10,
          fontSize:12, fontWeight:700, cursor:"pointer",
          background: active===id?"#fff":"transparent",
          color: active===id?"#0f0f0f":"#555", transition:"all .2s",
        }}>{label}</button>
      ))}
    </div>
  );
}

// ── МАРКЕТ: КАРТКА УГОДИ ──────────────────────────────────────────────────────
function DealCard({ deal, onOpen, joined, onJoin }) {
  const p = pct(deal), d = disc(deal);
  const isIn = joined[deal.id];
  const col = p>=90?"#f97316":p>=60?"#eab308":"#22c55e";
  return (
    <div onClick={()=>onOpen(deal)} style={{
      background:"#f0f0f0", borderRadius:20, overflow:"hidden",
      border:`1px solid ${isIn?"#22c55e44":"#2a2a2a"}`, cursor:"pointer",
      boxShadow: deal.hot?"0 4px 24px rgba(249,115,22,0.12)":"none",
    }}>
      <div style={{display:"flex",gap:6,padding:"10px 14px 0"}}>
        {deal.hot&&<span style={{background:"#f97316",color:"#111",fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:8}}>🔥 ГАРЯЧЕ</span>}
        <span style={{marginLeft:"auto",background:"#16a34a22",color:"#16a34a",fontSize:11,fontWeight:800,padding:"3px 8px",borderRadius:8}}>-{d}%</span>
      </div>
      <div style={{padding:"10px 14px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{fontSize:22,width:36,height:36,background:"#f0f0f0",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{deal.avatar}</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#e5e5e5"}}>{deal.seller}</div>
            <div style={{fontSize:10,color:"#888"}}>📍{deal.city} · ⭐{deal.rating}</div>
          </div>
          {isIn&&<div style={{marginLeft:"auto",width:28,height:28,background:"#22c55e",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#111",fontSize:14}}>✓</div>}
        </div>
        <div style={{fontSize:15,fontWeight:800,color:"#111",marginBottom:8,lineHeight:1.3}}>{deal.title}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:12}}>
          <span style={{fontSize:22,fontWeight:900,color:"#16a34a"}}>₴{deal.group}</span>
          <span style={{fontSize:12,color:"#999",textDecoration:"line-through"}}>₴{deal.retail}</span>
          <span style={{fontSize:11,color:"#888"}}>/ {deal.unit}</span>
        </div>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:11,color:"#888"}}>Учасників</span>
            <span style={{fontSize:11,fontWeight:700,color:col}}>{deal.joined}/{deal.needed}</span>
          </div>
          <div style={{height:6,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${p}%`,background:col,borderRadius:3,transition:"width .5s"}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#888"}}>⏰ {deal.days} {deal.days===1?"день":"дні"}</span>
          <button onClick={e=>{e.stopPropagation();onJoin(deal.id);}} style={{
            background: isIn?"#16a34a":"#22c55e", color:"#111", border:"none",
            borderRadius:10, padding:"6px 14px", fontSize:12, fontWeight:800, cursor:"pointer",
          }}>{isIn?"✓ В групі":"Приєднатись"}</button>
        </div>
      </div>
    </div>
  );
}

// ── МАРКЕТ: ГОЛОВНА ───────────────────────────────────────────────────────────
function MarketPage({ joined, onJoin, onOpen }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("hot");

  let list = cat==="all"?DEALS:DEALS.filter(d=>d.cat===cat);
  if (search) list = list.filter(d=>d.title.toLowerCase().includes(search.toLowerCase())||d.seller.toLowerCase().includes(search.toLowerCase()));
  if (sort==="hot") list=[...list].sort((a,b)=>pct(b)-pct(a));
  if (sort==="new") list=[...list].sort((a,b)=>(b.id>a.id?1:-1));
  if (sort==="disc") list=[...list].sort((a,b)=>disc(b)-disc(a));

  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",padding:"24px 16px 20px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:24,fontWeight:900,color:"#111",letterSpacing:-1}}>СпільноКуп</div>
            <div style={{fontSize:11,color:"#16a34a"}}>Малий бізнес — великі можливості</div>
          </div>
          <div style={{background:"rgba(34,197,94,0.2)",border:"1px solid #22c55e44",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:900,color:"#16a34a"}}>₴4 280 000</div>
            <div style={{fontSize:9,color:"#16a34a"}}>зекономлено разом</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["847","продавців","#22c55e"],["12 430","угод","#86efac"],["23","міст","#4ade80"]].map(([v,l,c],i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:10,color:"#888",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"0 16px 12px"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Пошук: курчата, мед, сир..."
          style={{width:"100%",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:14,padding:"12px 16px",color:"#111",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
      </div>

      <div style={{display:"flex",gap:8,padding:"0 16px 12px",overflowX:"auto",scrollbarWidth:"none"}}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} style={{
            whiteSpace:"nowrap",padding:"8px 14px",borderRadius:14,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
            background:cat===c.id?"#22c55e":"#1a1a1a", color:cat===c.id?"#fff":"#888",
          }}>{c.icon} {c.label}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:6,padding:"0 16px 16px"}}>
        {[["hot","🔥 Гарячі"],["new","✨ Нові"],["disc","💰 Знижка"]].map(([s,l])=>(
          <button key={s} onClick={()=>setSort(s)} style={{
            padding:"6px 12px",borderRadius:10,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
            background:sort===s?"#22c55e22":"transparent", color:sort===s?"#22c55e":"#555",
          }}>{l}</button>
        ))}
      </div>

      <div style={{padding:"0 16px 80px",display:"flex",flexDirection:"column",gap:12}}>
        {list.map(d=><DealCard key={d.id} deal={d} onOpen={onOpen} joined={joined} onJoin={onJoin}/>)}
        {list.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#999"}}><div style={{fontSize:48}}>🔍</div><div style={{marginTop:12}}>Нічого не знайдено</div></div>}
      </div>
    </div>
  );
}

// ── ДЕТАЛІ УГОДИ ─────────────────────────────────────────────────────────────
function DealDetail({ deal, onBack, joined, onJoin, onBuy }) {
  const [qty, setQty] = useState(deal.min);
  const p = pct(deal), d = disc(deal);
  const isIn = joined[deal.id];
  const col = p>=90?"#f97316":p>=60?"#eab308":"#22c55e";

  return (
    <div style={{paddingBottom:100}}>
      <div style={{background:"linear-gradient(180deg,#f0fdf4,#ffffff)",padding:"20px 16px 24px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:14,cursor:"pointer",marginBottom:16,padding:0,fontWeight:700}}>← Назад</button>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {deal.hot&&<span style={{background:"#f97316",color:"#111",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:8}}>🔥 ГАРЯЧЕ</span>}
          <span style={{background:"#16a34a22",color:"#16a34a",fontSize:11,fontWeight:800,padding:"4px 10px",borderRadius:8}}>-{d}%</span>
        </div>
        <h1 style={{fontSize:22,fontWeight:900,color:"#111",margin:"0 0 16px",lineHeight:1.3}}>{deal.title}</h1>
        <div style={{background:"#ecfdf5",border:"1px solid #bbf7d0",borderRadius:14,padding:14,display:"flex",gap:12,alignItems:"center"}}>
          <div style={{fontSize:36,width:52,height:52,background:"#f0fdf4",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{deal.avatar}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:"#111"}}>{deal.seller}</div>
            <div style={{fontSize:11,color:"#888",marginTop:2}}>📍{deal.city}</div>
            <div style={{fontSize:11,color:"#eab308",marginTop:2}}>⭐{deal.rating} · {deal.deals} угод</div>
          </div>
          <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#888",marginBottom:4}}>Перевірений</div><div style={{fontSize:20}}>✅</div></div>
        </div>
      </div>

      <div style={{padding:16,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"#ecfdf5",border:"1px solid #bbf7d0",borderRadius:16,padding:16}}>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:8}}>
            <span style={{fontSize:32,fontWeight:900,color:"#16a34a"}}>₴{deal.group}</span>
            <span style={{fontSize:16,color:"#999",textDecoration:"line-through"}}>₴{deal.retail}</span>
            <span style={{fontSize:14,color:"#888"}}>/ {deal.unit}</span>
          </div>
          <div style={{fontSize:13,color:"#16a34a"}}>💰 Економія ₴{deal.retail-deal.group} на {deal.unit}</div>
        </div>

        <div style={{background:"#f0f0f0",borderRadius:16,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:11,color:"#888"}}>Зібрано учасників</div>
              <div style={{fontSize:24,fontWeight:900,color:"#111"}}>{deal.joined} <span style={{fontSize:14,color:"#999"}}>/ {deal.needed}</span></div>
            </div>
            <Ring p={p} size={64} stroke={6} color={col}/>
          </div>
          <div style={{height:8,background:"#f0f0f0",borderRadius:4,overflow:"hidden",marginBottom:8}}>
            <div style={{height:"100%",width:`${p}%`,background:col,borderRadius:4}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
            <span style={{color:"#888"}}>⏰ Залишилось: <span style={{color:"#111",fontWeight:700}}>{deal.days} дн.</span></span>
            <span style={{color:col,fontWeight:700}}>{p}% зібрано</span>
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {deal.tags.map((t,i)=><span key={i} style={{background:"#f0f0f0",color:"#888",fontSize:12,padding:"6px 12px",borderRadius:10}}>{t}</span>)}
        </div>

        <div style={{background:"#f0f0f0",borderRadius:16,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:8}}>📋 Опис</div>
          <div style={{fontSize:13,color:"#888",lineHeight:1.6}}>{deal.desc}</div>
        </div>

        {!isIn&&(
          <div style={{background:"#f0f0f0",borderRadius:16,padding:16}}>
            <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:12}}>📦 Кількість ({deal.unit})</div>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <button onClick={()=>setQty(Math.max(deal.min,qty-1))} style={{width:40,height:40,borderRadius:12,background:"#f0f0f0",border:"none",color:"#111",fontSize:20,cursor:"pointer"}}>−</button>
              <span style={{fontSize:24,fontWeight:900,color:"#111",flex:1,textAlign:"center"}}>{qty}</span>
              <button onClick={()=>setQty(Math.min(deal.max,qty+1))} style={{width:40,height:40,borderRadius:12,background:"#22c55e",border:"none",color:"#111",fontSize:20,cursor:"pointer"}}>+</button>
            </div>
            <div style={{fontSize:12,color:"#888",marginTop:8,textAlign:"center"}}>Мін. {deal.min} · Макс. {deal.max} {deal.unit}</div>
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:64,left:"50%",transform:"translateX(-50%)",width:358,padding:"12px 16px",background:"#ffffff",borderTop:"1px solid #e0e0e0",zIndex:50}}>
        {isIn?(
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,background:"#dcfce7",border:"1px solid #22c55e44",borderRadius:14,padding:14,textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:800,color:"#16a34a"}}>✓ Ти в групі!</div>
              <div style={{fontSize:11,color:"#16a34a",marginTop:2}}>Повідомимо коли наберуть</div>
            </div>
            <button onClick={()=>onBuy(deal,qty)} style={{background:"#6366f1",color:"#111",border:"none",borderRadius:14,padding:"0 16px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
              📱 QR
            </button>
          </div>
        ):(
          <button onClick={()=>{onJoin(deal.id);onBuy(deal,qty);}} style={{width:"100%",padding:16,background:"#22c55e",border:"none",borderRadius:14,color:"#111",fontSize:16,fontWeight:900,cursor:"pointer"}}>
            Приєднатись · ₴{deal.group*qty} за {qty} {deal.unit}
          </button>
        )}
      </div>
    </div>
  );
}

// ── МОЇ ПОКУПКИ ───────────────────────────────────────────────────────────────
function MyDealsPage({ joined, onOpen }) {
  const my = DEALS.filter(d=>joined[d.id]);
  return (
    <div style={{padding:"20px 16px 80px"}}>
      <h2 style={{color:"#111",fontSize:20,fontWeight:900,marginBottom:4}}>Мої покупки</h2>
      <p style={{color:"#888",fontSize:13,marginBottom:20}}>{my.length} активних</p>
      {my.length===0?(
        <div style={{textAlign:"center",padding:"80px 0"}}>
          <div style={{fontSize:56}}>🛒</div>
          <div style={{color:"#999",marginTop:16,fontSize:14}}>Ти ще не приєднався до жодної покупки</div>
          <div style={{color:"#444",marginTop:8,fontSize:12}}>Перейди на вкладку Маркет</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {my.map(d=>(
            <div key={d.id} onClick={()=>onOpen(d)} style={{background:"#f0f0f0",borderRadius:16,padding:16,cursor:"pointer",border:"1px solid #22c55e33"}}>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:28,width:48,height:48,background:"#f0f0f0",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center"}}>{d.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#111",lineHeight:1.3}}>{d.title}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:2}}>{d.seller}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:900,color:"#16a34a"}}>₴{d.group}</div>
                  <div style={{fontSize:10,color:"#888"}}>/{d.unit}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,height:6,background:"#f0f0f0",borderRadius:3,marginRight:12,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct(d)}%`,background:"#22c55e",borderRadius:3}}/>
                </div>
                <span style={{background:"#dcfce7",color:"#16a34a",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:8}}>✓ В групі</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── QR: ПОКУПЕЦЬ ─────────────────────────────────────────────────────────────
function BuyerQRPage({ order, onBack }) {
  const [status, setStatus] = useState(order.status);
  const [done, setDone] = useState(false);
  useEffect(()=>{
    if(status==="scanned"){ const t=setTimeout(()=>{setStatus("completed");setDone(true);},2000); return()=>clearTimeout(t); }
  },[status]);
  return (
    <div style={{padding:20,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:14,cursor:"pointer",padding:0,fontWeight:700,alignSelf:"flex-start"}}>← Назад</button>
      <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:4,marginTop:12}}>Замовлення #{order.id}</div>
      <div style={{fontSize:18,fontWeight:900,color:"#111",marginBottom:4,textAlign:"center"}}>{order.item}</div>
      <div style={{fontSize:13,color:"#888",marginBottom:20}}>{order.qty} {order.unit} · ₴{order.amount}</div>
      <div style={{
        padding:"8px 20px",borderRadius:20,marginBottom:20,fontSize:12,fontWeight:800,
        background:status==="completed"?"#052e16":status==="scanned"?"#1c1400":"#0d1117",
        color:status==="completed"?"#22c55e":status==="scanned"?"#eab308":"#6366f1",
        border:`1px solid ${status==="completed"?"#22c55e44":status==="scanned"?"#eab30844":"#6366f144"}`,
      }}>{status==="completed"?"✅ Отримано":status==="scanned"?"⏳ Обробляється...":"🔵 Очікує сканування"}</div>
      <div style={{padding:20,background:"#fff",borderRadius:24,boxShadow:status==="completed"?"0 0 40px rgba(34,197,94,0.3)":"0 0 40px rgba(0,0,0,0.5)",marginBottom:20,position:"relative"}}>
        <QRCode value={order.qr} size={180}/>
        {status==="completed"&&(
          <div style={{position:"absolute",inset:0,background:"rgba(5,46,22,0.88)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
            <div style={{fontSize:48}}>✅</div>
            <div style={{fontSize:14,fontWeight:900,color:"#16a34a"}}>Отримано!</div>
          </div>
        )}
      </div>
      <div style={{background:"#f0f0f0",borderRadius:16,padding:16,width:"100%",boxSizing:"border-box",fontSize:12,color:"#888",textAlign:"center",lineHeight:1.6}}>
        Покажи цей QR код продавцю при отриманні товару
      </div>
      {done&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#dcfce7",border:"1px solid #22c55e",borderRadius:16,padding:"14px 20px",display:"flex",gap:10,alignItems:"center",zIndex:999}}>
          <span style={{fontSize:20}}>🎉</span>
          <div><div style={{fontSize:13,fontWeight:800,color:"#16a34a"}}>Товар отримано!</div><div style={{fontSize:11,color:"#16a34a"}}>Кошти зараховано продавцю</div></div>
        </div>
      )}
    </div>
  );
}

// ── QR: СКАНЕР ────────────────────────────────────────────────────────────────
function ScannerView({ onScan, onClose, orders }) {
  const [line, setLine] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(()=>{ const t=setInterval(()=>setLine(p=>(p+2)%100),16); return()=>clearInterval(t); },[]);
  useEffect(()=>{ const t=setTimeout(()=>setResult(orders.find(o=>o.status==="paid")||orders[0]),2500); return()=>clearTimeout(t); },[]);
  if(result) return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.96)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"20px 20px 0",overflowY:"auto"}}>
      <div style={{background:"#f0f0f0",borderRadius:24,padding:20,width:"100%",boxSizing:"border-box"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>✅</div>
          <div style={{fontSize:18,fontWeight:900,color:"#16a34a"}}>QR зчитано!</div>
          <div style={{fontSize:12,color:"#888",marginTop:4}}>#{result.id}</div>
        </div>
        <div style={{background:"#f0f0f0",borderRadius:14,padding:14,marginBottom:16,display:"flex",flexDirection:"column",gap:10}}>
          {[["👤 Покупець",result.buyer],["📦 Товар",result.item],["⚖️ Кількість",`${result.qty} ${result.unit}`]].map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#888"}}>{k}</span><span style={{color:"#111",fontWeight:700}}>{v}</span></div>
          ))}
          <div style={{height:1,background:"#2a2a2a"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#888"}}>💰 До виплати</span><span style={{color:"#16a34a",fontSize:20,fontWeight:900}}>₴{result.amount}</span></div>
        </div>
        <div style={{background:"#dcfce7",border:"1px solid #22c55e33",borderRadius:12,padding:12,marginBottom:20,fontSize:12,color:"#16a34a",textAlign:"center"}}>
          💳 Кошти зарахуються одразу після підтвердження
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"14px 16px",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:14,color:"#888",fontSize:13,fontWeight:700,cursor:"pointer"}}>Скасувати</button>
          <button onClick={()=>onScan(result)} style={{flex:2,padding:"14px 16px",background:"#22c55e",border:"none",borderRadius:14,color:"#111",fontSize:14,fontWeight:800,cursor:"pointer"}}>Підтвердити видачу ✓</button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.96)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{fontSize:18,fontWeight:800,color:"#111",marginBottom:4}}>Скануй QR покупця</div>
      <div style={{fontSize:12,color:"#888",marginBottom:24}}>Направ камеру на QR код</div>
      <div style={{width:260,height:260,position:"relative",margin:"0 auto 24px"}}>
        <div style={{width:"100%",height:"100%",background:"#f0f0f0",borderRadius:16,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",backgroundSize:"20px 20px"}}/>
          <div style={{position:"absolute",left:0,right:0,height:2,top:`${line}%`,background:"linear-gradient(90deg,transparent,#22c55e,transparent)",boxShadow:"0 0 8px #22c55e"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.3}}><QRCode value="preview" size={120}/></div>
        </div>
        {[{top:-2,left:-2,borderTop:"3px solid #22c55e",borderLeft:"3px solid #22c55e"},{top:-2,right:-2,borderTop:"3px solid #22c55e",borderRight:"3px solid #22c55e"},{bottom:-2,left:-2,borderBottom:"3px solid #22c55e",borderLeft:"3px solid #22c55e"},{bottom:-2,right:-2,borderBottom:"3px solid #22c55e",borderRight:"3px solid #22c55e"}].map((s,i)=>(
          <div key={i} style={{position:"absolute",width:24,height:24,borderRadius:3,...s}}/>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
        <div style={{width:8,height:8,background:"#22c55e",borderRadius:"50%"}}/>
        <span style={{fontSize:13,color:"#16a34a"}}>Сканування...</span>
      </div>
      <button onClick={onClose} style={{padding:"12px 32px",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:14,color:"#888",fontSize:13,fontWeight:700,cursor:"pointer"}}>Закрити</button>
    </div>
  );
}

// ── QR: ПРОДАВЕЦЬ (ПАНЕЛЬ) ────────────────────────────────────────────────────
function SellerScanPage({ orders, onScanDone, onBack }) {
  const [showScan, setShowScan] = useState(false);
  const [completed, setCompleted] = useState(orders.filter(o=>o.status==="completed").map(o=>o.id));
  const [paid, setPaid] = useState(null);

  function handleScan(order) {
    setShowScan(false);
    setCompleted(p=>[...p,order.id]);
    setPaid(order);
    onScanDone(order.id);
    setTimeout(()=>setPaid(null),4000);
  }
  const pending = orders.filter(o=>!completed.includes(o.id));
  const done = orders.filter(o=>completed.includes(o.id));

  return (
    <div>
      {showScan&&<ScannerView onScan={handleScan} onClose={()=>setShowScan(false)} orders={pending}/>}
      {paid&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#dcfce7",border:"1px solid #22c55e",borderRadius:16,padding:"14px 20px",display:"flex",gap:10,alignItems:"center",zIndex:999,whiteSpace:"nowrap"}}>
          <span style={{fontSize:20}}>💰</span>
          <div><div style={{fontSize:13,fontWeight:800,color:"#16a34a"}}>+₴{paid.amount} зараховано!</div><div style={{fontSize:11,color:"#16a34a"}}>{paid.buyer}</div></div>
        </div>
      )}
      <div style={{background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",padding:"24px 16px 20px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:13,cursor:"pointer",padding:0,marginBottom:12,fontWeight:700}}>← Назад</button>
        <div style={{fontSize:20,fontWeight:900,color:"#111",marginBottom:4}}>📱 Сканер QR кодів</div>
        <div style={{fontSize:12,color:"#16a34a",marginBottom:16}}>Скануй QR — отримуй гроші моментально</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Очікують",pending.length,"#fbbf24"],["Видано",done.length,"#22c55e"],["Зароблено",`₴${done.reduce((s,o)=>s+o.amount,0)}`,"#86efac"]].map(([l,v,c],i)=>(
            <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:10,color:"#16a34a",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:16}}>
        <button onClick={()=>setShowScan(true)} style={{width:"100%",padding:20,background:"#22c55e",border:"none",borderRadius:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:"0 8px 32px rgba(34,197,94,0.4)"}}>
          <span style={{fontSize:32}}>📷</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:17,fontWeight:900,color:"#111"}}>Сканувати QR код</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Натисни і направ камеру на код покупця</div>
          </div>
        </button>
      </div>
      {pending.length>0&&(
        <div style={{padding:"0 16px 8px"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#fbbf24",marginBottom:10}}>⏳ Очікують видачі ({pending.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {pending.map(o=>(
              <div key={o.id} style={{background:"#f0f0f0",borderRadius:14,padding:14,border:"1px solid #e0e0e0"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:44,height:44,background:"#f0f0f0",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{o.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#111"}}>{o.buyer}</div>
                    <div style={{fontSize:12,color:"#888"}}>{o.item} · {o.qty} {o.unit}</div>
                    <div style={{fontSize:11,color:"#888",marginTop:2}}>📞 {o.phone}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:900,color:"#fbbf24"}}>₴{o.amount}</div>
                    <div style={{fontSize:10,color:"#888",marginTop:2}}>очікує</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {done.length>0&&(
        <div style={{padding:"8px 16px 80px"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#16a34a",marginBottom:10}}>✅ Видано ({done.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {done.map(o=>(
              <div key={o.id} style={{background:"#ecfdf5",borderRadius:14,padding:14,border:"1px solid #bbf7d0",opacity:0.8}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:36,height:36,background:"#dcfce7",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{o.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>{o.buyer}</div>
                    <div style={{fontSize:11,color:"#999"}}>{o.item} · {o.qty} {o.unit}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:900,color:"#16a34a"}}>+₴{o.amount}</div>
                    <div style={{fontSize:10,color:"#22c55e88"}}>✓ зараховано</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── QR ХАБ (вибір ролі) ───────────────────────────────────────────────────────
function QRHub({ orders, onScanDone }) {
  const [mode, setMode] = useState("choose");
  const [order, setOrder] = useState(orders.find(o=>o.status==="paid")||orders[0]);
  if(mode==="buyer") return <BuyerQRPage order={order} onBack={()=>setMode("choose")}/>;
  if(mode==="seller") return <SellerScanPage orders={orders} onScanDone={onScanDone} onBack={()=>setMode("choose")}/>;
  return (
    <div style={{padding:24,display:"flex",flexDirection:"column",height:"100%",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:36,marginTop:20}}>
        <div style={{fontSize:52,marginBottom:12}}>🤝</div>
        <h1 style={{fontSize:24,fontWeight:900,color:"#111",margin:"0 0 8px"}}>QR Видача</h1>
        <p style={{fontSize:13,color:"#888",margin:0}}>Система підтвердження отримання товарів</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:32}}>
        <button onClick={()=>setMode("buyer")} style={{background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:20,padding:20,cursor:"pointer",textAlign:"left",display:"flex",gap:16,alignItems:"center"}}>
          <div style={{width:56,height:56,background:"#ecfdf5",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>📱</div>
          <div><div style={{fontSize:17,fontWeight:800,color:"#111",marginBottom:4}}>Я — Покупець</div><div style={{fontSize:12,color:"#888",lineHeight:1.5}}>Показую QR код для отримання товару</div></div>
        </button>
        <button onClick={()=>setMode("seller")} style={{background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:20,padding:20,cursor:"pointer",textAlign:"left",display:"flex",gap:16,alignItems:"center"}}>
          <div style={{width:56,height:56,background:"#e0f2fe",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>📷</div>
          <div><div style={{fontSize:17,fontWeight:800,color:"#111",marginBottom:4}}>Я — Продавець</div><div style={{fontSize:12,color:"#888",lineHeight:1.5}}>Сканую QR і підтверджую видачу</div></div>
        </button>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:18,padding:18}}>
        <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:14}}>⚡ Як це працює</div>
        {[["💳","Покупець оплачує онлайн"],["📱","Отримує унікальний QR"],["📷","Продавець сканує при видачі"],["💰","Гроші миттєво на рахунок"]].map(([icon,text],i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"center",marginBottom:i<3?12:0}}>
            <div style={{width:32,height:32,background:"#f0f0f0",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>
            <div style={{fontSize:13,color:"#888"}}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── БІЗНЕС: ПРОДАВЕЦЬ ─────────────────────────────────────────────────────────
function SellerDashboard({ onCreateDeal, onScanQR }) {
  const [tab, setTab] = useState("dash");
  const listings = DEALS.slice(0,3);
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",padding:"24px 16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:40}}>{SELLER_PROFILE.avatar}</div>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:"#111"}}>{SELLER_PROFILE.name}</div>
            <div style={{fontSize:12,color:"#a5b4fc"}}>📍{SELLER_PROFILE.city} · ⭐{SELLER_PROFILE.rating} · {DEALS.slice(0,3).length} активних угод</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["₴28 400","виручка міс.","#a5b4fc"],["156","покупців","#c4b5fd"],["4.9⭐","рейтинг","#ddd6fe"]].map(([v,l,c],i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:10,color:"#a5b4fc",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid #1a1a1a",padding:"0 16px"}}>
        {[["dash","📊 Дашборд"],["listings","📦 Товари"],["orders","📋 Замовлення"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"14px 0",border:"none",background:"transparent",fontSize:11,fontWeight:700,cursor:"pointer",color:tab===t?"#22c55e":"#555",borderBottom:tab===t?"2px solid #22c55e":"2px solid transparent"}}>{l}</button>
        ))}
      </div>
      <div style={{padding:16}}>
        {tab==="dash"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#f0f0f0",borderRadius:16,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:12}}>📈 Продажі за тиждень</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
                {[40,65,45,80,55,90,70].map((h,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",height:h*0.8,background:i===5?"#22c55e":"#2a2a2a",borderRadius:4}}/>
                    <div style={{fontSize:9,color:"#999"}}>{"ПнВтСрЧтПтСбНд".slice(i*2,i*2+2)}</div>
                  </div>
                ))}
              </div>
            </div>
            {[["💰","Заробіток сьогодні","₴3,840","#22c55e"],["👥","Нових учасників","+12","#6366f1"],["⏳","Активних угод","3","#f97316"],["⭐","Нових відгуків","5","#eab308"]].map(([ic,l,v,c],i)=>(
              <div key={i} style={{background:"#f0f0f0",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>{ic}</span>
                <div style={{flex:1}}><div style={{fontSize:11,color:"#888"}}>{l}</div><div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div></div>
              </div>
            ))}
            <button onClick={onScanQR} style={{width:"100%",padding:16,background:"#dcfce7",border:"1px solid #22c55e44",borderRadius:14,color:"#16a34a",fontSize:14,fontWeight:800,cursor:"pointer"}}>
              📷 Сканувати QR покупця
            </button>
          </div>
        )}
        {tab==="listings"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={onCreateDeal} style={{background:"#22c55e",color:"#111",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:800,cursor:"pointer"}}>+ Створити нову пропозицію</button>
            {listings.map(d=>(
              <div key={d.id} style={{background:"#f0f0f0",borderRadius:14,padding:14,border:"1px solid #e0e0e0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#111",flex:1}}>{d.title}</div>
                  <span style={{background:d.joined>=d.needed?"#22c55e22":"#f9731622",color:d.joined>=d.needed?"#22c55e":"#f97316",fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:8,marginLeft:8}}>{d.joined>=d.needed?"✅ Зібрано":"🔄 Активна"}</span>
                </div>
                <div style={{display:"flex",gap:16,fontSize:12,color:"#888"}}>
                  <span>👥{d.joined}/{d.needed}</span><span>💰₴{d.group}/{d.unit}</span><span>⏰{d.days}дн.</span>
                </div>
                <div style={{marginTop:8,height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct(d)}%`,background:"#22c55e",borderRadius:2}}/>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="orders"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {name:"Олена Василенко",item:"Курчата 4кг",amount:"₴272",status:"✅ Підтверджено",time:"Сьогодні 10:24"},
              {name:"Микола Іваненко",item:"Яйця 2 лотки",amount:"₴190",status:"⏳ Очікує",time:"Сьогодні 09:15"},
              {name:"Ірина Коваль",item:"Курчата 6кг",amount:"₴408",status:"✅ Підтверджено",time:"Вчора 18:33"},
              {name:"Андрій Мельник",item:"Яйця 1 лоток",amount:"₴95",status:"🚚 Доставляється",time:"Вчора 14:20"},
            ].map((o,i)=>(
              <div key={i} style={{background:"#f0f0f0",borderRadius:14,padding:14,display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,background:"#f0f0f0",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👤</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{o.name}</div>
                  <div style={{fontSize:11,color:"#888"}}>{o.item} · {o.time}</div>
                  <div style={{fontSize:11,marginTop:2}}>{o.status}</div>
                </div>
                <div style={{fontSize:16,fontWeight:900,color:"#16a34a"}}>{o.amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── НОВА УГОДА ────────────────────────────────────────────────────────────────
function CreateDeal({ onBack }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({cat:"",title:"",unit:"",desc:"",retail:"",group:"",needed:"",days:"",min:"1"});
  const set = (k,v)=>setForm(p=>({...p,[k]:v}));
  const dsc = form.retail&&form.group?Math.round(((form.retail-form.group)/form.retail)*100):0;
  if(step===3) return (
    <div style={{padding:24,textAlign:"center",paddingTop:80}}>
      <div style={{fontSize:72}}>🎉</div>
      <h2 style={{color:"#111",fontSize:24,fontWeight:900,margin:"16px 0 8px"}}>Опубліковано!</h2>
      <p style={{color:"#888",fontSize:13,lineHeight:1.7}}>Люди вже бачать твій товар!</p>
      <div style={{background:"#f0f0f0",borderRadius:14,padding:16,margin:"24px 0",display:"flex",gap:12,alignItems:"center"}}>
        <div style={{fontSize:32}}>📦</div>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#111"}}>{form.title||"Новий товар"}</div>
          <div style={{fontSize:12,color:"#16a34a"}}>₴{form.group}/{form.unit||"шт"} · -{dsc}%</div>
        </div>
      </div>
      <button onClick={onBack} style={{width:"100%",padding:16,background:"#22c55e",border:"none",borderRadius:14,color:"#111",fontSize:15,fontWeight:800,cursor:"pointer"}}>На Бізнес панель</button>
    </div>
  );
  return (
    <div style={{padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:"#111",fontSize:18,fontWeight:900,margin:0}}>Нова пропозиція</h2>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>{[1,2].map(s=><div key={s} style={{width:28,height:4,borderRadius:2,background:step>=s?"#22c55e":"#2a2a2a"}}/>)}</div>
      </div>
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:13,color:"#888"}}>Крок 1 з 2 — Інформація про товар</div>
          <div>
            <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>📦 Категорія</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {CATEGORIES.filter(c=>c.id!=="all").map(c=>(
                <button key={c.id} onClick={()=>set("cat",c.id)} style={{padding:"8px 12px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:form.cat===c.id?"#22c55e":"#1a1a1a",color:form.cat===c.id?"#fff":"#888"}}>{c.icon} {c.label}</button>
              ))}
            </div>
          </div>
          {[{k:"title",l:"📝 Назва",p:"напр. Курчата бройлер"},{k:"unit",l:"⚖️ Одиниця",p:"кг, шт, лоток..."},{k:"desc",l:"📄 Опис",p:"Розкажи про якість і умови..."}].map(f=>(
            <div key={f.k}>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>{f.l}</label>
              {f.k==="desc"
                ?<textarea value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} rows={3} style={{width:"100%",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:12,padding:"12px 14px",color:"#111",fontSize:14,boxSizing:"border-box",outline:"none",resize:"none"}}/>
                :<input value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} style={{width:"100%",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:12,padding:"12px 14px",color:"#111",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
              }
            </div>
          ))}
          <button onClick={()=>form.title&&form.unit&&setStep(2)} style={{background:form.title&&form.unit?"#22c55e":"#2a2a2a",color:"#111",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:800,cursor:"pointer"}}>Далі →</button>
        </div>
      )}
      {step===2&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:13,color:"#888"}}>Крок 2 з 2 — Ціна та умови</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{k:"retail",l:"🏪 Ціна в магазині (₴)",p:"95"},{k:"group",l:"🤝 Оптова ціна (₴)",p:"68"}].map(f=>(
              <div key={f.k}>
                <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>{f.l}</label>
                <input type="number" value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} style={{width:"100%",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:12,padding:"12px 14px",color:"#111",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
          </div>
          {dsc>0&&<div style={{background:"#dcfce7",border:"1px solid #22c55e44",borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12}}><div style={{fontSize:28}}>🎯</div><div><div style={{fontSize:11,color:"#16a34a"}}>Покупці побачать знижку</div><div style={{fontSize:22,fontWeight:900,color:"#16a34a"}}>-{dsc}%</div></div></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{k:"needed",l:"👥 Мін. учасників",p:"30"},{k:"days",l:"⏰ Днів до дедлайну",p:"7"},{k:"min",l:"📦 Мін. замовлення",p:"2"}].map(f=>(
              <div key={f.k}>
                <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>{f.l}</label>
                <input type="number" value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} style={{width:"100%",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:12,padding:"12px 14px",color:"#111",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
          </div>
          <button onClick={()=>form.retail&&form.group&&form.needed&&setStep(3)} style={{background:form.retail&&form.group&&form.needed?"#22c55e":"#2a2a2a",color:"#111",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:800,cursor:"pointer"}}>Опублікувати 🚀</button>
        </div>
      )}
    </div>
  );
}

// ── ГАМАНЕЦЬ ─────────────────────────────────────────────────────────────────
function WalletPage({ onWithdraw }) {
  return (
    <div>
      <div style={{margin:"0 16px 20px",background:"linear-gradient(135deg,#0a1628,#1e3a5f,#0a1628)",borderRadius:24,padding:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,background:"rgba(96,165,250,0.08)",borderRadius:"50%"}}/>
        <div style={{fontSize:12,color:"#93c5fd",marginBottom:6,fontWeight:600}}>Загальний баланс</div>
        <div style={{fontSize:38,fontWeight:900,color:"#111",letterSpacing:-1,marginBottom:4}}>₴3 380,32</div>
        <div style={{fontSize:12,color:"#60a5fa",marginBottom:20}}>{SELLER_PROFILE.fop}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:12}}>
            <div style={{fontSize:10,color:"#93c5fd",marginBottom:4}}>💰 Доступно</div>
            <div style={{fontSize:20,fontWeight:900,color:"#16a34a"}}>₴2 847,20</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:12}}>
            <div style={{fontSize:10,color:"#93c5fd",marginBottom:4}}>⏳ Утримується</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fbbf24"}}>₴533,12</div>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"0 16px 20px"}}>
        <button onClick={onWithdraw} style={{background:"#22c55e",border:"none",borderRadius:16,padding:"16px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <span style={{fontSize:24}}>🏦</span>
          <span style={{fontSize:13,fontWeight:800,color:"#111"}}>Вивести кошти</span>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>На IBAN рахунок</span>
        </button>
        <button style={{background:"#f0f0f0",border:"1px solid #2a2a4a",borderRadius:16,padding:"16px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <span style={{fontSize:24}}>📊</span>
          <span style={{fontSize:13,fontWeight:800,color:"#111"}}>Статистика</span>
          <span style={{fontSize:10,color:"#888"}}>Доходи і витрати</span>
        </button>
      </div>
      <div style={{margin:"0 16px 20px",background:"#f0f0f0",borderRadius:18,padding:16}}>
        <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:14}}>📈 Березень 2024</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
          {[["Дохід","₴12 840","#22c55e"],["Комісія","₴513","#f87171"],["Чистий","₴12 327","#60a5fa"]].map(([l,v,c],i)=>(
            <div key={i} style={{background:"#f0f0f0",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#999",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:50}}>
          {[320,580,420,890,640,1100,760,480,920,1200,840,680,1050,920].map((h,i)=>(
            <div key={i} style={{flex:1,background:i===13?"#22c55e":"#2a2a2a",borderRadius:3,height:`${(h/1200)*100}%`,minHeight:4}}/>
          ))}
        </div>
        <div style={{fontSize:10,color:"#999",marginTop:6,textAlign:"center"}}>Доходи за 14 днів</div>
      </div>
      <div style={{margin:"0 16px 80px"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:12}}>🧾 Останні операції</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {TRANSACTIONS.map(t=>(
            <div key={t.id} style={{background:"#f0f0f0",borderRadius:14,padding:14,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:12,background:t.type==="income"?"#052e16":t.type==="withdrawal"?"#0d1a2e":t.type==="hold"?"#1c1400":"#1a0a0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                {t.type==="income"?"💰":t.type==="withdrawal"?"🏦":t.type==="hold"?"⏳":"⚠️"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"#e5e5e5",lineHeight:1.3}}>{t.desc}</div>
                <div style={{fontSize:10,color:"#999",marginTop:3}}>{t.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:900,color:t.type==="income"?"#22c55e":t.type==="withdrawal"?"#60a5fa":t.type==="hold"?"#fbbf24":"#f87171"}}>
                  {t.type==="income"?"+":t.type==="withdrawal"?"-":""}₴{t.type==="income"?t.net.toFixed(2):t.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ВИВЕДЕННЯ КОШТІВ ──────────────────────────────────────────────────────────
function WithdrawPage({ onBack }) {
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const avail = 2847.20;
  const fee = amount?(parseFloat(amount)*0.01).toFixed(2):"0.00";
  const recv = amount?(parseFloat(amount)-parseFloat(fee)).toFixed(2):"0.00";
  if(done) return (
    <div style={{padding:24}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:14,cursor:"pointer",padding:0,fontWeight:700}}>← Назад</button>
      <div style={{textAlign:"center",marginTop:20,marginBottom:32}}>
        <div style={{fontSize:56,marginBottom:16}}>✅</div>
        <div style={{fontSize:22,fontWeight:900,color:"#111",marginBottom:8}}>Заявку подано!</div>
        <div style={{fontSize:13,color:"#888",lineHeight:1.6}}>Кошти надійдуть протягом 1-2 робочих днів</div>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:18,padding:18,marginBottom:20}}>
        {[["💳 Рахунок",`${SELLER_PROFILE.iban.slice(0,10)}...${SELLER_PROFILE.iban.slice(-4)}`],["🏦 Банк",SELLER_PROFILE.bank],["💰 Сума",`₴${parseFloat(amount).toLocaleString()}`],["📊 Комісія (1%)",`-₴${fee}`],["✅ Отримаєш",`₴${recv}`]].map(([k,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<4?"1px solid #222":"none",fontSize:13}}>
            <span style={{color:"#888"}}>{k}</span><span style={{color:"#111",fontWeight:700}}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{width:"100%",padding:16,background:"#22c55e",border:"none",borderRadius:14,color:"#111",fontSize:15,fontWeight:800,cursor:"pointer"}}>Повернутись до гаманця</button>
    </div>
  );
  return (
    <div style={{padding:20}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:14,cursor:"pointer",padding:0,fontWeight:700}}>← Назад</button>
      <h2 style={{color:"#111",fontSize:20,fontWeight:900,margin:"16px 0 4px"}}>Вивести кошти</h2>
      <p style={{color:"#888",fontSize:13,margin:"0 0 24px"}}>Доступно: <span style={{color:"#16a34a",fontWeight:800}}>₴{avail.toFixed(2)}</span></p>
      <div style={{background:"#f0f0f0",borderRadius:16,padding:16,marginBottom:20}}>
        <div style={{fontSize:11,color:"#888",marginBottom:8}}>Рахунок отримувача</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,background:"#e0f2fe",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏦</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{SELLER_PROFILE.fop}</div>
            <div style={{fontSize:11,color:"#60a5fa"}}>{SELLER_PROFILE.iban.slice(0,16)}...</div>
          </div>
          <div style={{marginLeft:"auto",background:"#dcfce7",color:"#16a34a",fontSize:10,padding:"4px 8px",borderRadius:8,fontWeight:700}}>✓ Верифіковано</div>
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,color:"#888",marginBottom:8}}>Сума виведення (₴)</div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:900,color:"#999"}}>₴</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"
            style={{width:"100%",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:14,padding:"16px 16px 16px 40px",color:"#111",fontSize:24,fontWeight:900,boxSizing:"border-box",outline:"none"}}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          {[500,1000,2000,avail].map((v,i)=>(
            <button key={i} onClick={()=>setAmount(v.toString())} style={{flex:1,padding:"8px 0",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:10,color:"#888",fontSize:11,fontWeight:700,cursor:"pointer"}}>{i===3?"Все":`₴${v}`}</button>
          ))}
        </div>
      </div>
      {amount&&parseFloat(amount)>0&&(
        <div style={{background:"#e0f2fe",border:"1px solid #1e3a5f",borderRadius:14,padding:14,marginBottom:20}}>
          {[["Сума виведення",`₴${parseFloat(amount).toFixed(2)}`],["Комісія (1%)",`-₴${fee}`],["Отримаєш",`₴${recv}`]].map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:i<2?"1px solid #1e3a5f":"none"}}>
              <span style={{color:i===2?"#93c5fd":"#666"}}>{k}</span>
              <span style={{color:i===2?"#60a5fa":"#fff",fontWeight:i===2?900:700,fontSize:i===2?16:13}}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{background:"#1c1400",border:"1px solid #fbbf2433",borderRadius:14,padding:14,marginBottom:20,display:"flex",gap:10}}>
        <span style={{fontSize:20}}>⚠️</span>
        <div style={{fontSize:12,color:"#fbbf24",lineHeight:1.6}}>Нагадуємо: сплатіть єдиний податок ₴1,600 до 31.03</div>
      </div>
      <button onClick={()=>amount&&parseFloat(amount)>0&&setDone(true)}
        style={{width:"100%",padding:16,background:amount&&parseFloat(amount)>0?"#22c55e":"#2a2a2a",border:"none",borderRadius:14,color:"#111",fontSize:15,fontWeight:800,cursor:"pointer",opacity:amount&&parseFloat(amount)>0?1:0.5}}>
        Вивести ₴{amount||"0"} →
      </button>
    </div>
  );
}

// ── ДОКУМЕНТИ ─────────────────────────────────────────────────────────────────
function DocsPage({ onReceipt }) {
  const [tab, setTab] = useState("receipts");
  const filtered = {
    receipts: DOCUMENTS.filter(d=>d.type==="receipt"),
    reports: DOCUMENTS.filter(d=>d.type==="report"),
    acts: DOCUMENTS.filter(d=>d.type==="act"),
  }[tab]||[];
  return (
    <div style={{padding:"0 16px"}}>
      <Tabs items={[["receipts","🧾 Чеки"],["reports","📊 Звіти"],["acts","📋 Акти"]]} active={tab} onChange={setTab}/>
      {tab==="reports"&&(
        <div style={{background:"#1c1400",border:"1px solid #fbbf2433",borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:"#fbbf24",marginBottom:8}}>📅 Податковий календар</div>
          {[{date:"31.03",desc:"Єдиний податок · ₴1,600",done:false},{date:"31.03",desc:"ЄСВ за Q1 · ₴4,290",done:false},{date:"28.02",desc:"Єдиний податок · ₴1,600",done:true}].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 0",borderBottom:i<2?"1px solid #2a1a00":"none"}}>
              <div style={{width:32,textAlign:"center"}}>{t.done?<span style={{color:"#16a34a",fontSize:16}}>✓</span>:<span style={{color:"#fbbf24",fontSize:16}}>⏰</span>}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:t.done?"#555":"#fbbf24",fontWeight:700}}>{t.date}</div>
                <div style={{fontSize:11,color:t.done?"#444":"#888"}}>{t.desc}</div>
              </div>
              {!t.done&&<span style={{background:"#fbbf2422",color:"#fbbf24",fontSize:10,padding:"3px 8px",borderRadius:8,fontWeight:700}}>Сплатити</span>}
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:80}}>
        {filtered.map(doc=>(
          <div key={doc.id} onClick={()=>onReceipt(doc)} style={{background:"#f0f0f0",borderRadius:14,padding:14,cursor:"pointer",border:"1px solid #e0e0e0",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:44,height:44,background:doc.type==="receipt"?"#052e16":doc.type==="report"?"#0d1a2e":"#1a0d2e",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
              {doc.type==="receipt"?"🧾":doc.type==="report"?"📊":"📋"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:"#111"}}>{doc.title}</div>
              <div style={{fontSize:11,color:"#888",marginTop:2}}>{doc.desc}</div>
              <div style={{fontSize:10,color:"#444",marginTop:2}}>📅 {doc.date}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:900,color:"#16a34a"}}>₴{doc.amount.toLocaleString()}</div>
              <div style={{fontSize:10,color:"#999",marginTop:2}}>→ PDF</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ЧЕК ──────────────────────────────────────────────────────────────────────
function ReceiptPage({ doc, onBack }) {
  const comm = (doc.amount*0.04).toFixed(2);
  const net = (doc.amount-parseFloat(comm)).toFixed(2);
  return (
    <div style={{padding:20}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#16a34a",fontSize:14,cursor:"pointer",padding:0,fontWeight:700}}>← Назад</button>
      <div style={{background:"#f0f0f0",borderRadius:20,padding:20,marginTop:16,marginBottom:16}}>
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:20,borderBottom:"2px dashed #2a2a2a"}}>
          <div style={{fontSize:32,marginBottom:8}}>🧾</div>
          <div style={{fontSize:16,fontWeight:900,color:"#111"}}>Платіжний чек</div>
          <div style={{fontSize:11,color:"#888",marginTop:4}}>СпільноКуп · #{doc.id}</div>
          <div style={{fontSize:11,color:"#999",marginTop:2}}>{doc.date}</div>
        </div>
        <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #2a2a2a"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:8,fontWeight:700}}>ПРОДАВЕЦЬ</div>
          {[["ФОП",SELLER_PROFILE.fop],["ІПН",SELLER_PROFILE.ipn],["Група",SELLER_PROFILE.group],["IBAN",`${SELLER_PROFILE.iban.slice(0,10)}...${SELLER_PROFILE.iban.slice(-4)}`]].map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:"#888"}}>{k}</span><span style={{color:"#111",fontWeight:600}}>{v}</span></div>
          ))}
        </div>
        {doc.buyer&&<div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #2a2a2a"}}><div style={{fontSize:11,color:"#888",marginBottom:8,fontWeight:700}}>ПОКУПЕЦЬ</div><div style={{fontSize:13,color:"#111",fontWeight:700}}>{doc.buyer}</div></div>}
        <div style={{marginBottom:16,paddingBottom:16,borderBottom:"2px dashed #2a2a2a"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:8,fontWeight:700}}>РОЗРАХУНОК</div>
          {[["Сума продажу",`₴${doc.amount.toLocaleString()}`,"#fff"],["Комісія (4%)",`-₴${comm}`,"#f87171"],["До виплати",`₴${net}`,"#22c55e"]].map(([k,v,c],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:i===2?15:13,fontWeight:i===2?900:600,padding:"6px 0"}}>
              <span style={{color:i===2?"#86efac":"#666"}}>{k}</span><span style={{color:c}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:"#f0f0f0",borderRadius:12,padding:12}}>
          <div style={{fontSize:11,color:"#fbbf24",marginBottom:8,fontWeight:800}}>📊 ПОДАТКОВА ІНФОРМАЦІЯ</div>
          {[["Система","Спрощена, 2 група"],["Ставка ЄП","₴1,600/міс (фіксована)"],["ПДВ","Не є платником"]].map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:"#888"}}>{k}</span><span style={{color:"#fbbf24",fontWeight:600}}>{v}</span></div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={{flex:1,padding:"12px 16px",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:14,color:"#888",fontSize:13,fontWeight:700,cursor:"pointer"}}>📤 Поділитись</button>
        <button style={{flex:1,padding:16,background:"#22c55e",border:"none",borderRadius:14,color:"#111",fontSize:15,fontWeight:800,cursor:"pointer"}}>⬇️ PDF</button>
      </div>
    </div>
  );
}

// ── ФОП ПРОФІЛЬ ───────────────────────────────────────────────────────────────
function FopProfile({ onSetup }) {
  return (
    <div style={{padding:20}}>
      <div style={{background:"linear-gradient(135deg,#1a0d2e,#2d1b69)",borderRadius:20,padding:20,marginBottom:20}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:40}}>🏛️</div>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:"#111"}}>{SELLER_PROFILE.fop}</div>
            <div style={{fontSize:11,color:"#a78bfa",marginTop:2}}>ІПН: {SELLER_PROFILE.ipn}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["Група",SELLER_PROFILE.group],["Система","Спрощена"],["Ставка ЄП",SELLER_PROFILE.taxRate],["ПДВ","Не платник"]].map(([l,v],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:"#a78bfa",marginBottom:2}}>{l}</div>
              <div style={{fontSize:12,fontWeight:800,color:"#111"}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:16,padding:16,marginBottom:16}}>
        <div style={{fontSize:12,color:"#888",marginBottom:10,fontWeight:700}}>🏦 Банківський рахунок</div>
        <div style={{fontSize:12,color:"#111",fontWeight:700,marginBottom:4}}>{SELLER_PROFILE.bank}</div>
        <div style={{fontSize:11,color:"#60a5fa",fontFamily:"monospace"}}>{SELLER_PROFILE.iban}</div>
        <div style={{marginTop:10,display:"flex",gap:8}}>
          <span style={{background:"#dcfce7",color:"#16a34a",fontSize:10,padding:"3px 8px",borderRadius:8,fontWeight:700}}>✓ Верифіковано</span>
          <span style={{background:"#e0f2fe",color:"#60a5fa",fontSize:10,padding:"3px 8px",borderRadius:8,fontWeight:700}}>UAH рахунок</span>
        </div>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:16,padding:16,marginBottom:20}}>
        <div style={{fontSize:12,color:"#888",marginBottom:12,fontWeight:700}}>📊 Податкові зобов'язання</div>
        {[["📅","Єдиний податок","₴1,600 · до 20-го щомісяця","pending"],["💼","ЄСВ","₴1,430 · щоквартально","ok"],["📋","Звітність","1 раз на рік · до 01.03","ok"],["📄","РРО/ПРРО","Не потрібен (2 група)","ok"]].map(([ic,l,v,s],i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:i<3?"1px solid #222":"none"}}>
            <span style={{fontSize:20}}>{ic}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#111"}}>{l}</div>
              <div style={{fontSize:11,color:"#888"}}>{v}</div>
            </div>
            <span style={{fontSize:16}}>{s==="pending"?"⚠️":"✅"}</span>
          </div>
        ))}
      </div>
      <button onClick={onSetup} style={{width:"100%",padding:"12px 16px",background:"#f0f0f0",border:"1px solid #e0e0e0",borderRadius:14,color:"#888",fontSize:13,fontWeight:700,cursor:"pointer"}}>✏️ Оновити дані ФОП</button>
    </div>
  );
}

// ── ГАМАНЕЦЬ: ОБГОРТКА ────────────────────────────────────────────────────────
function WalletSection() {
  const [sub, setSub] = useState("wallet"); // wallet | docs | fop
  const [page, setPage] = useState(null); // withdraw | receipt | fopSetup
  const [selDoc, setSelDoc] = useState(null);

  if(page==="withdraw") return <WithdrawPage onBack={()=>setPage(null)}/>;
  if(page==="receipt"&&selDoc) return <ReceiptPage doc={selDoc} onBack={()=>{setPage(null);setSelDoc(null);}}/>;

  return (
    <div>
      {!page&&(
        <div style={{background:"#ffffff",padding:"16px 20px 12px",borderBottom:"1px solid #1a1a1a"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,background:"#f0f0f0",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{SELLER_PROFILE.avatar}</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#111"}}>{SELLER_PROFILE.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:6,height:6,background:"#22c55e",borderRadius:"50%"}}/>
                <span style={{fontSize:10,color:"#16a34a",fontWeight:700}}>ФОП · Верифіковано</span>
              </div>
            </div>
            <div style={{marginLeft:"auto",background:"#f0f0f0",borderRadius:10,padding:"6px 10px",fontSize:11,fontWeight:700,color:"#fbbf24"}}>⚠️ Сплатити ЄП</div>
          </div>
        </div>
      )}
      <Tabs items={[["wallet","💰 Гаманець"],["docs","🧾 Документи"],["fop","🏛️ ФОП"]]} active={sub} onChange={setSub}/>
      {sub==="wallet"&&<WalletPage onWithdraw={()=>setPage("withdraw")}/>}
      {sub==="docs"&&<DocsPage onReceipt={doc=>{setSelDoc(doc);setPage("receipt");}}/>}
      {sub==="fop"&&<FopProfile onSetup={()=>setPage("fopSetup")}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ГОЛОВНИЙ ДОДАТОК
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("market");
  const [page, setPage] = useState(null); // dealDetail | createDeal | buyerQR | sellerScan
  const [joined, setJoined] = useState({});
  const [selDeal, setSelDeal] = useState(null);
  const [selOrder, setSelOrder] = useState(null);
  const [orders, setOrders] = useState(INIT_ORDERS);

  function handleJoin(id) { setJoined(j=>({...j,[id]:true})); }

  function openDeal(deal) { setSelDeal(deal); setPage("dealDetail"); }

  function openBuy(deal) {
    const order = orders.find(o=>o.id==="SC-8841") || orders[0];
    setSelOrder(order);
    setPage("buyerQR");
  }

  function handleScanDone(orderId) {
    setOrders(prev=>prev.map(o=>o.id===orderId?{...o,status:"completed"}:o));
  }

  const showNav = page===null;

  function renderContent() {
    if(page==="dealDetail"&&selDeal) return <DealDetail deal={selDeal} joined={joined} onJoin={handleJoin} onBack={()=>{setPage(null);setSelDeal(null);}} onBuy={openBuy}/>;
    if(page==="createDeal") return <CreateDeal onBack={()=>setPage(null)}/>;
    if(page==="buyerQR"&&selOrder) return <BuyerQRPage order={selOrder} onBack={()=>{setPage(null);setSelOrder(null);}}/>;

    switch(tab) {
      case "market": return <MarketPage joined={joined} onJoin={handleJoin} onOpen={openDeal}/>;
      case "my": return <MyDealsPage joined={joined} onOpen={openDeal}/>;
      case "qr": return <QRHub orders={orders} onScanDone={handleScanDone}/>;
      case "seller": return <SellerDashboard onCreateDeal={()=>setPage("createDeal")} onScanQR={()=>setTab("qr")}/>;
      case "wallet": return <WalletSection/>;
      default: return null;
    }
  }

  const isMobile = window.innerWidth <= 500;

  return (
    <div style={{ minHeight:"100vh", background:"#f0f2f5", display:"flex", justifyContent:"center", alignItems: isMobile ? "stretch" : "flex-start", padding: isMobile ? 0 : "20px 0", fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ width: isMobile ? "100%" : 390, height: isMobile ? "100vh" : 820, background:"#ffffff", borderRadius: isMobile ? 0 : 44, overflow:"hidden", boxShadow: isMobile ? "none" : "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px #e0e0e0", position:"relative" }}>
        <div style={{ height: showNav ? "calc(100% - 64px)" : "100%", overflowY:"auto" }}>
          {renderContent()}
        </div>
        {showNav && <Nav tab={tab} setTab={setTab}/>}
      </div>
    </div>
  );
}
