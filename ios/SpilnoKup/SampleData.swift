import Foundation

enum SampleData {
    static let deals: [Deal] = [
        Deal(id:1,cat:.farm,seller:"Ферма Петренків",avatar:"🌾",city:"Бориспіль",rating:4.9,dealCount:34,title:"Курчата бройлер живою вагою",unit:"кг",retail:95,group:68,minQty:2,maxQty:10,joined:18,needed:30,days:3,desc:"Вирощені без антибіотиків. Природний корм.",tags:["Без антибіотиків","Доставка Київ","від 2 кг"],hot:true),
        Deal(id:2,cat:.honey,seller:"Пасіка Коваля",avatar:"🐝",city:"Черкаси",rating:5.0,dealCount:67,title:"Акацієвий мед з пасіки",unit:"банка 1л",retail:380,group:260,minQty:1,maxQty:5,joined:22,needed:25,days:1,desc:"Якісний світлий мед. Сертифікат якості.",tags:["Сертифікат","Акація 2024","Нова Пошта"],hot:true),
        Deal(id:3,cat:.food,seller:"Пекарня Оленки",avatar:"👩‍🍳",city:"Київ",rating:4.8,dealCount:89,title:"Набір домашньої випічки (12 шт)",unit:"набір",retail:320,group:210,minQty:1,maxQty:3,joined:9,needed:15,days:2,desc:"Круасани, булочки з маком, рогалики.",tags:["Щопонеділка","Домашній рецепт","Самовивіз"],hot:false),
        Deal(id:4,cat:.veggies,seller:"Город дядька Миколи",avatar:"👨‍🌾",city:"Вишгород",rating:4.7,dealCount:21,title:"Картопля молода власного врожаю",unit:"кг",retail:28,group:17,minQty:5,maxQty:50,joined:41,needed:50,days:2,desc:"Сорт Беллароза. Без хімії.",tags:["Без хімії","Власний врожай","від 5 кг"],hot:true),
        Deal(id:5,cat:.dairy,seller:"Молочна від Галини",avatar:"🐄",city:"Бровари",rating:4.9,dealCount:112,title:"Домашній сир та сметана",unit:"набір",retail:280,group:195,minQty:1,maxQty:4,joined:7,needed:20,days:4,desc:"Сир 500г + сметана 400г.",tags:["Від однієї корови","Вт та Пт","Доставка"],hot:false),
        Deal(id:6,cat:.handmade,seller:"Майстерня Тетяни",avatar:"🧶",city:"Київ",rating:4.6,dealCount:45,title:"Вишита сорочка (замовлення групою)",unit:"шт",retail:1800,group:1200,minQty:1,maxQty:1,joined:6,needed:10,days:7,desc:"Ручна вишивка. Розміри S-XL.",tags:["Ручна робота","S-XL","Авторська"],hot:false),
        Deal(id:7,cat:.cafe,seller:"Кав'ярня Зерно",avatar:"☕",city:"Київ",rating:4.8,dealCount:203,title:"Купон: будь-яка кава × 5",unit:"купон",retail:175,group:110,minQty:1,maxQty:10,joined:44,needed:50,days:1,desc:"Еспресо, лате, капучіно. 60 днів.",tags:["Будь-яка кава","60 днів","Саксаганського 15"],hot:true),
        Deal(id:8,cat:.farm,seller:"Ферма Петренків",avatar:"🌾",city:"Бориспіль",rating:4.9,dealCount:34,title:"Яйця домашні (лоток 30 шт)",unit:"лоток",retail:145,group:95,minQty:1,maxQty:5,joined:12,needed:20,days:3,desc:"Несучки вільного вигулу.",tags:["Вільний вигул","Яскравий жовток","Доставка"],hot:false),
        Deal(id:9,cat:.veggies,seller:"Еко-ферма Зелений Гай",avatar:"🥕",city:"Фастів",rating:4.8,dealCount:56,title:"Набір сезонних овочів (10 кг)",unit:"набір",retail:450,group:290,minQty:1,maxQty:5,joined:15,needed:25,days:4,desc:"Помідори, огірки, перець, морква.",tags:["Сезонне","Органік","10 кг"],hot:true),
        Deal(id:10,cat:.dairy,seller:"Сироварня Карпат",avatar:"🧀",city:"Львів",rating:4.9,dealCount:78,title:"Набір крафтових сирів (5 видів)",unit:"набір",retail:680,group:450,minQty:1,maxQty:3,joined:8,needed:15,days:5,desc:"Бринза, сулугуні, качотта, камамбер, рікотта.",tags:["Карпатське","5 видів","Термопакування"],hot:false),
        Deal(id:11,cat:.food,seller:"Кондитерська Солодка",avatar:"🎂",city:"Одеса",rating:4.7,dealCount:134,title:"Набір тістечок преміум (8 шт)",unit:"набір",retail:520,group:340,minQty:1,maxQty:4,joined:19,needed:20,days:1,desc:"Наполеон, еклери, тірамісу.",tags:["Преміум","Нова Пошта","Щодня"],hot:true),
        Deal(id:12,cat:.farm,seller:"Рибне господарство Дніпро",avatar:"🐟",city:"Дніпро",rating:4.6,dealCount:42,title:"Форель свіжа (охолоджена)",unit:"кг",retail:420,group:280,minQty:2,maxQty:8,joined:11,needed:20,days:3,desc:"Райдужна форель без ГМО.",tags:["Свіжа","Чиста вода","від 2 кг"],hot:false),
        Deal(id:13,cat:.honey,seller:"Пасіка Лісова",avatar:"🌻",city:"Полтава",rating:5.0,dealCount:91,title:"Мед соняшниковий + пилок",unit:"набір",retail:320,group:210,minQty:1,maxQty:6,joined:28,needed:30,days:2,desc:"Мед 1л + квітковий пилок 200г.",tags:["Соняшник","+ Пилок","Сертифікат"],hot:true),
        Deal(id:14,cat:.cafe,seller:"Чайна Майстерня",avatar:"🍵",city:"Київ",rating:4.8,dealCount:167,title:"Набір китайського чаю (6 сортів)",unit:"набір",retail:890,group:590,minQty:1,maxQty:3,joined:5,needed:12,days:6,desc:"Пуер, улун, жасмин та інші.",tags:["6 сортів","Китай","Подарункова"],hot:false),
        Deal(id:15,cat:.handmade,seller:"Свічкова Мануфактура",avatar:"🕯",city:"Харків",rating:4.7,dealCount:63,title:"Набір ароматичних свічок (4 шт)",unit:"набір",retail:560,group:380,minQty:1,maxQty:5,joined:13,needed:18,days:4,desc:"Соєвий віск. Лаванда, ваніль, кедр, цитрус.",tags:["Соєвий віск","Натуральні","В коробці"],hot:false),
    ]

    static let seller = Seller(
        name: "Ферма Петренків", avatar: "🌾",
        fop: "ФОП Петренко Василь Іванович", ipn: "3456789012",
        iban: "UA213223130000026007233566001", bank: "АТ КБ «ПриватБанк»",
        group: "2 група", taxRate: "₴1,600/міс",
        city: "Бориспіль", rating: 4.9
    )

    static let transactions: [Transaction] = [
        Transaction(id:"T1",type:.income,desc:"Курчата × 4кг (Олена В.)",amount:272,date:"24.03 · 14:22"),
        Transaction(id:"T2",type:.income,desc:"Яйця × 2 лотки (Микола І.)",amount:190,date:"24.03 · 11:05"),
        Transaction(id:"T3",type:.withdrawal,desc:"Виведення на IBAN",amount:3200,date:"23.03 · 18:00"),
        Transaction(id:"T4",type:.hold,desc:"Очікує видачі",amount:272,date:"24.03 · 10:15"),
    ]

    static let orders: [Order] = [
        Order(id:"SC-8841",buyer:"Олена Василенко",avatar:"👩",item:"Курчата бройлер",qty:4,unit:"кг",amount:272,status:.paid),
        Order(id:"SC-8842",buyer:"Микола Іваненко",avatar:"👨",item:"Яйця домашні",qty:2,unit:"лотки",amount:190,status:.done),
        Order(id:"SC-8843",buyer:"Ірина Коваль",avatar:"👩‍🦱",item:"Курчата бройлер",qty:6,unit:"кг",amount:408,status:.paid),
    ]

    static let chats: [Chat] = [
        Chat(id:1,name:"Ферма Петренків",avatar:"🌾",last:"Курчата будуть у четвер, чекайте!",time:"14:22",unread:2,online:true),
        Chat(id:2,name:"Пасіка Коваля",avatar:"🐝",last:"Дякую за замовлення! Мед вже пакуємо",time:"12:05",unread:0,online:true),
        Chat(id:3,name:"Пекарня Оленки",avatar:"👩‍🍳",last:"Самовивіз з 10:00 до 18:00",time:"вчора",unread:1,online:false),
        Chat(id:4,name:"Молочна від Галини",avatar:"🐄",last:"Нова партія сиру буде в п'ятницю",time:"вчора",unread:0,online:false),
        Chat(id:5,name:"Кав'ярня Зерно",avatar:"☕",last:"Купони активовані, приходьте!",time:"Пн",unread:0,online:true),
    ]

    static let chatMessages: [Int: [ChatMessage]] = [
        1: [
            ChatMessage(from:.them,text:"Привіт! Ваше замовлення на курчата прийнято",time:"10:00"),
            ChatMessage(from:.me,text:"Дякую! Коли можна забрати?",time:"10:15"),
            ChatMessage(from:.them,text:"Курчата будуть у четвер, чекайте!",time:"14:22"),
        ],
        2: [
            ChatMessage(from:.them,text:"Мед вже готовий до відправки",time:"11:00"),
            ChatMessage(from:.me,text:"Відправляйте Новою Поштою, будь ласка",time:"11:30"),
            ChatMessage(from:.them,text:"Дякую за замовлення! Мед вже пакуємо",time:"12:05"),
        ],
        3: [
            ChatMessage(from:.them,text:"Ваша випічка готова!",time:"09:00"),
            ChatMessage(from:.me,text:"О котрій можна забрати?",time:"09:20"),
            ChatMessage(from:.them,text:"Самовивіз з 10:00 до 18:00",time:"09:25"),
        ],
    ]

    static let cities = ["Київ","Харків","Одеса","Дніпро","Львів","Бориспіль","Бровари","Черкаси","Полтава"]

    static let shops: [(name: String, lat: Double, lng: Double, type: String)] = [
        ("Ферма Петренків", 49.2331, 28.4682, "farm"),
        ("Пасіка Коваля", 49.2295, 28.4785, "honey"),
        ("Пекарня Оленки", 49.2350, 28.4590, "food"),
        ("Молочна від Галини", 49.2270, 28.4720, "dairy"),
        ("Кав'ярня Зерно", 49.2315, 28.4650, "cafe"),
        ("Еко-ферма Зелений Гай", 49.2380, 28.4550, "veggies"),
        ("Сироварня Карпат", 49.2260, 28.4830, "dairy"),
        ("Ринок Урожай", 49.2340, 28.4710, "farm"),
    ]
}
