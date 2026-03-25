import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role, DealStatus, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // Очистка
  await prisma.auction.deleteMany();
  await prisma.qrToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.fopProfile.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.websocketEvent.deleteMany();
  await prisma.consentLog.deleteMany();
  await prisma.phoneVerification.deleteMany();
  await prisma.pickupPoint.deleteMany();
  await prisma.user.deleteMany();

  // ── Продавці ──────────────────────────────────────────────────────────────

  const seller1 = await prisma.user.create({
    data: {
      name: 'Ферма Петренків',
      city: 'Бориспіль',
      role: Role.SELLER,
      isActive: true,
      isVerified: true,
      phoneEncrypted: 'encrypted:+380671234567',
      phoneHash: crypto.createHash('sha256').update('+380671234567').digest('hex'),
      emailEncrypted: 'encrypted:petrenko.farm@gmail.com',
      emailHash: crypto.createHash('sha256').update('petrenko.farm@gmail.com').digest('hex'),
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: 'Пасіка Коваля',
      city: 'Черкаси',
      role: Role.SELLER,
      isActive: true,
      isVerified: true,
      phoneEncrypted: 'encrypted:+380509876543',
      phoneHash: crypto.createHash('sha256').update('+380509876543').digest('hex'),
      emailEncrypted: 'encrypted:koval.honey@ukr.net',
      emailHash: crypto.createHash('sha256').update('koval.honey@ukr.net').digest('hex'),
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      name: 'Пекарня Оленки',
      city: 'Київ, Поділ',
      role: Role.SELLER,
      isActive: true,
      isVerified: true,
      phoneEncrypted: 'encrypted:+380631112233',
      phoneHash: crypto.createHash('sha256').update('+380631112233').digest('hex'),
      emailEncrypted: 'encrypted:olenka.bakery@gmail.com',
      emailHash: crypto.createHash('sha256').update('olenka.bakery@gmail.com').digest('hex'),
    },
  });

  console.log('✓ Sellers created');

  // ── ФОП профілі ───────────────────────────────────────────────────────────

  await prisma.fopProfile.createMany({
    data: [
      {
        userId: seller1.id,
        fopName: 'ФОП Петренко Іван Миколайович',
        ipn: '1234567890',
        iban: 'UA213223130000026007233566001',
        bankName: 'ПриватБанк',
        fopGroup: '3',
        taxRate: '5%',
        verified: true,
        verifiedAt: new Date(),
        diiaVerified: true,
      },
      {
        userId: seller2.id,
        fopName: 'ФОП Коваль Олександр Петрович',
        ipn: '0987654321',
        iban: 'UA573510050000026006542897301',
        bankName: 'Моноbank',
        fopGroup: '3',
        taxRate: '5%',
        verified: true,
        verifiedAt: new Date(),
        diiaVerified: true,
      },
      {
        userId: seller3.id,
        fopName: 'ФОП Кравченко Олена Сергіївна',
        ipn: '1122334455',
        iban: 'UA903052990000026005624718923',
        bankName: 'ПУМБ',
        fopGroup: '2',
        taxRate: '5%',
        verified: true,
        verifiedAt: new Date(),
        diiaVerified: false,
      },
    ],
  });

  console.log('✓ FOP profiles created');

  // ── Гаманці продавців ─────────────────────────────────────────────────────

  await prisma.wallet.createMany({
    data: [
      { userId: seller1.id, availableBalance: 24500, heldBalance: 3200, totalEarned: 87600, totalWithdrawn: 59900 },
      { userId: seller2.id, availableBalance: 18200, heldBalance: 5700, totalEarned: 134500, totalWithdrawn: 110600 },
      { userId: seller3.id, availableBalance: 9800, heldBalance: 1890, totalEarned: 45200, totalWithdrawn: 33510 },
    ],
  });

  console.log('✓ Wallets created');

  // ── Покупці ───────────────────────────────────────────────────────────────

  const buyer1 = await prisma.user.create({
    data: {
      name: 'Олена Василенко',
      city: 'Київ',
      role: Role.BUYER,
      isActive: true,
      isVerified: true,
      phoneEncrypted: 'encrypted:+380974445566',
      phoneHash: crypto.createHash('sha256').update('+380974445566').digest('hex'),
      emailEncrypted: 'encrypted:olena.vasylenko@gmail.com',
      emailHash: crypto.createHash('sha256').update('olena.vasylenko@gmail.com').digest('hex'),
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Микола Іваненко',
      city: 'Київ',
      role: Role.BUYER,
      isActive: true,
      isVerified: true,
      phoneEncrypted: 'encrypted:+380667778899',
      phoneHash: crypto.createHash('sha256').update('+380667778899').digest('hex'),
      emailEncrypted: 'encrypted:mykola.ivanenko@ukr.net',
      emailHash: crypto.createHash('sha256').update('mykola.ivanenko@ukr.net').digest('hex'),
    },
  });

  await prisma.wallet.createMany({
    data: [
      { userId: buyer1.id, availableBalance: 1250, heldBalance: 210, totalEarned: 0, totalWithdrawn: 0 },
      { userId: buyer2.id, availableBalance: 830, heldBalance: 68, totalEarned: 0, totalWithdrawn: 0 },
    ],
  });

  console.log('✓ Buyers created');

  // ── Deals ─────────────────────────────────────────────────────────────────

  const deal1 = await prisma.deal.create({
    data: {
      sellerId: seller1.id,
      title: 'Курчата бройлер 4кг',
      description: 'Домашні курчата бройлер, вирощені на натуральних кормах без антибіотиків. Тушка ~4кг, охолоджена.',
      category: 'meat',
      retailPrice: 95,
      groupPrice: 68,
      unit: 'шт',
      minQty: 1,
      maxQty: 5,
      needed: 30,
      joined: 18,
      deadline: daysFromNow(3),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['м\'ясо', 'курка', 'фермерське'],
      isHot: true,
      isNew: false,
      city: 'Бориспіль',
      views: 342,
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      sellerId: seller1.id,
      title: 'Яйця домашні лоток',
      description: 'Домашні яйця від вільновигульних курей. Лоток 30шт, розмір С1.',
      category: 'dairy',
      retailPrice: 145,
      groupPrice: 95,
      unit: 'лоток',
      minQty: 1,
      maxQty: 3,
      needed: 20,
      joined: 12,
      deadline: daysFromNow(3),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['яйця', 'фермерське', 'домашнє'],
      isHot: false,
      isNew: true,
      city: 'Бориспіль',
      views: 187,
    },
  });

  const deal3 = await prisma.deal.create({
    data: {
      sellerId: seller2.id,
      title: 'Мед акацієвий 1л',
      description: 'Натуральний акацієвий мед з власної пасіки. Збір 2025 року, без домішок.',
      category: 'grocery',
      retailPrice: 380,
      groupPrice: 260,
      unit: 'банка',
      minQty: 1,
      maxQty: 3,
      needed: 25,
      joined: 22,
      deadline: daysFromNow(1),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['мед', 'натуральне', 'пасіка'],
      isHot: true,
      isNew: false,
      city: 'Черкаси',
      views: 520,
    },
  });

  const deal4 = await prisma.deal.create({
    data: {
      sellerId: seller3.id,
      title: 'Набір випічки 12шт',
      description: 'Асорті свіжої випічки: круасани, булочки з маком, синабони, штруделі. 12 штук у коробці.',
      category: 'bakery',
      retailPrice: 320,
      groupPrice: 210,
      unit: 'набір',
      minQty: 1,
      maxQty: 2,
      needed: 15,
      joined: 9,
      deadline: daysFromNow(2),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['випічка', 'свіже', 'десерт'],
      isHot: false,
      isNew: true,
      city: 'Київ, Поділ',
      views: 156,
    },
  });

  const deal5 = await prisma.deal.create({
    data: {
      sellerId: seller1.id,
      title: 'Картопля молода кг',
      description: 'Молода картопля з поля, копана вранці. Сорт Белла Роса, дрібна та середня.',
      category: 'vegetables',
      retailPrice: 28,
      groupPrice: 17,
      unit: 'кг',
      minQty: 3,
      maxQty: 20,
      needed: 50,
      joined: 41,
      deadline: daysFromNow(2),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['овочі', 'картопля', 'фермерське'],
      isHot: true,
      isNew: false,
      city: 'Бориспіль',
      views: 689,
    },
  });

  const deal6 = await prisma.deal.create({
    data: {
      sellerId: seller3.id,
      title: 'Купон кава × 5',
      description: 'Набір з 5 купонів на каву (лате/капучіно) у пекарні Оленки. Діє 30 днів.',
      category: 'services',
      retailPrice: 175,
      groupPrice: 110,
      unit: 'набір',
      minQty: 1,
      maxQty: 2,
      needed: 50,
      joined: 44,
      deadline: daysFromNow(1),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['кава', 'купон', 'напої'],
      isHot: true,
      isNew: false,
      city: 'Київ, Поділ',
      views: 412,
    },
  });

  const deal7 = await prisma.deal.create({
    data: {
      sellerId: seller2.id,
      title: 'Вишита сорочка',
      description: 'Традиційна українська вишиванка ручної роботи. Натуральний льон, хрестиковий шов.',
      category: 'clothing',
      retailPrice: 1800,
      groupPrice: 1200,
      unit: 'шт',
      minQty: 1,
      maxQty: 1,
      needed: 10,
      joined: 6,
      deadline: daysFromNow(7),
      status: DealStatus.ACTIVE,
      images: [],
      tags: ['вишиванка', 'ручна робота', 'одяг'],
      isHot: false,
      isNew: true,
      city: 'Черкаси',
      views: 234,
    },
  });

  console.log('✓ Deals created');

  // ── Замовлення ────────────────────────────────────────────────────────────

  const order1 = await prisma.order.create({
    data: {
      dealId: deal1.id,
      buyerId: buyer1.id,
      quantity: 2,
      amount: 136,
      status: OrderStatus.PAID,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      dealId: deal3.id,
      buyerId: buyer2.id,
      quantity: 1,
      amount: 260,
      status: OrderStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  const order3 = await prisma.order.create({
    data: {
      dealId: deal4.id,
      buyerId: buyer1.id,
      quantity: 1,
      amount: 210,
      status: OrderStatus.PAID,
    },
  });

  console.log('✓ Orders created');

  // ── Платежі ───────────────────────────────────────────────────────────────

  await prisma.payment.createMany({
    data: [
      {
        orderId: order1.id,
        buyerId: buyer1.id,
        amount: 136,
        idempotencyKey: crypto.randomUUID(),
        status: 'completed',
        paidAt: new Date(),
      },
      {
        orderId: order2.id,
        buyerId: buyer2.id,
        amount: 260,
        idempotencyKey: crypto.randomUUID(),
        status: 'completed',
        paidAt: new Date(),
      },
      {
        orderId: order3.id,
        buyerId: buyer1.id,
        amount: 210,
        idempotencyKey: crypto.randomUUID(),
        status: 'completed',
        paidAt: new Date(),
      },
    ],
  });

  console.log('✓ Payments created');

  // ── QR токени для PAID замовлень ──────────────────────────────────────────

  await prisma.qrToken.createMany({
    data: [
      {
        orderId: order1.id,
        token: crypto.randomBytes(16).toString('hex'),
        expiresAt: daysFromNow(7),
      },
      {
        orderId: order3.id,
        token: crypto.randomBytes(16).toString('hex'),
        expiresAt: daysFromNow(7),
      },
    ],
  });

  console.log('✓ QR tokens created');

  // ── Аукціон для "Вишита сорочка" ─────────────────────────────────────────

  await prisma.auction.create({
    data: {
      dealId: deal7.id,
      startPrice: 1800,
      currentPrice: 1200,
      minStep: 50,
      endsAt: daysFromNow(7),
      isActive: true,
    },
  });

  console.log('✓ Auction created');

  // ── Точки видачі ──────────────────────────────────────────────────────────

  await prisma.pickupPoint.createMany({
    data: [
      {
        name: 'Ферма Петренків — Склад',
        address: 'вул. Київський Шлях, 45',
        city: 'Бориспіль',
        lat: 50.3518,
        lng: 30.9548,
        type: 'seller',
        workHours: 'Пн-Сб 08:00-18:00',
        phone: '+380671234567',
        sellerId: seller1.id,
      },
      {
        name: 'Пасіка Коваля — Магазин',
        address: 'вул. Хрещатик, 12',
        city: 'Черкаси',
        lat: 49.4444,
        lng: 32.0598,
        type: 'seller',
        workHours: 'Пн-Пт 09:00-17:00',
        phone: '+380509876543',
        sellerId: seller2.id,
      },
      {
        name: 'Пекарня Оленки',
        address: 'вул. Сагайдачного, 28',
        city: 'Київ',
        lat: 50.4630,
        lng: 30.5179,
        type: 'seller',
        workHours: 'Щодня 07:00-21:00',
        phone: '+380631112233',
        sellerId: seller3.id,
      },
    ],
  });

  console.log('✓ Pickup points created');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
