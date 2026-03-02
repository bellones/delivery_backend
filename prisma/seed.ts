import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TEST_PASSWORD = '123456';
const HASH = bcrypt.hashSync(TEST_PASSWORD, 10);

async function main() {
  console.log('Seed: iniciando...');

  // 1. Categorias de lojas
  const categories = [
    { name: 'Pizza', slug: 'pizza', sortOrder: 1 },
    { name: 'Hambúrguer', slug: 'hamburguer', sortOrder: 2 },
    { name: 'Japonês', slug: 'japones', sortOrder: 3 },
    { name: 'Brasileira', slug: 'brasileira', sortOrder: 4 },
    { name: 'Lanches', slug: 'lanches', sortOrder: 5 },
    { name: 'Doces', slug: 'doces', sortOrder: 6 },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  const categoryPizza = await prisma.category.findUniqueOrThrow({ where: { slug: 'pizza' } });
  const categoryHamburguer = await prisma.category.findUniqueOrThrow({ where: { slug: 'hamburguer' } });
  console.log('Seed: categorias criadas.');

  // 2. Usuários (consumidor, entregadores, donos de loja, admin)
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      email: 'cliente@teste.com',
      passwordHash: HASH,
      name: 'Maria Consumidora',
      phone: '11999991111',
      role: 'CUSTOMER',
    },
  });

  const driver1 = await prisma.user.upsert({
    where: { email: 'entregador1@teste.com' },
    update: {},
    create: {
      email: 'entregador1@teste.com',
      passwordHash: HASH,
      name: 'João Entregador',
      phone: '11999992222',
      role: 'DRIVER',
    },
  });

  const driver2 = await prisma.user.upsert({
    where: { email: 'entregador2@teste.com' },
    update: {},
    create: {
      email: 'entregador2@teste.com',
      passwordHash: HASH,
      name: 'Pedro Motoboy',
      phone: '11999993333',
      role: 'DRIVER',
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: 'loja@pizzaria.com' },
    update: {},
    create: {
      email: 'loja@pizzaria.com',
      passwordHash: HASH,
      name: 'Carlos Pizzaiolo',
      phone: '11988881111',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'loja@burguer.com' },
    update: {},
    create: {
      email: 'loja@burguer.com',
      passwordHash: HASH,
      name: 'Ana Hamburgueria',
      phone: '11988882222',
      role: 'STORE_OWNER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@delivery.com' },
    update: {},
    create: {
      email: 'admin@delivery.com',
      passwordHash: HASH,
      name: 'Admin Sistema',
      phone: '11900000000',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Seed: usuários criados.');

  // 3. Endereços (cliente e lojas não têm address no schema de Store; endereço é do cliente para entrega)
  const addr1 = await prisma.address.upsert({
    where: { id: 'seed-addr-cliente-1' },
    update: {},
    create: {
      id: 'seed-addr-cliente-1',
      userId: customer.id,
      label: 'Casa',
      street: 'Rua das Flores',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isDefault: true,
    },
  });

  const addr2 = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'Trabalho',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 501',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false,
    },
  });
  console.log('Seed: endereços criados.');

  // 4. Lojas
  const store1 = await prisma.store.upsert({
    where: { slug: 'pizzaria-do-carlos' },
    update: {},
    create: {
      ownerId: owner1.id,
      categoryId: categoryPizza.id,
      name: 'Pizzaria do Carlos',
      slug: 'pizzaria-do-carlos',
      description: 'Pizzas artesanais e tradicionais. Delivery rápido.',
      deliveryFee: 8.5,
      minOrderValue: 25,
      deliveryTimeMinutes: 45,
      isActive: true,
      openingHours: {
        seg: { open: '18:00', close: '23:00' },
        ter: { open: '18:00', close: '23:00' },
        qua: { open: '18:00', close: '23:00' },
        qui: { open: '18:00', close: '23:00' },
        sex: { open: '18:00', close: '00:00' },
        sab: { open: '12:00', close: '00:00' },
        dom: { open: '12:00', close: '23:00' },
      },
    },
  });

  const store2 = await prisma.store.upsert({
    where: { slug: 'burger-ana' },
    update: {},
    create: {
      ownerId: owner2.id,
      categoryId: categoryHamburguer.id,
      name: 'Burger da Ana',
      slug: 'burger-ana',
      description: 'Hambúrgueres gourmet e batata frita.',
      deliveryFee: 6,
      minOrderValue: 20,
      deliveryTimeMinutes: 35,
      isActive: true,
    },
  });
  console.log('Seed: lojas criadas.');

  // 5. Categorias de produtos e produtos (Pizzaria)
  const pcPizzaBebidas =
    (await prisma.productCategory.findFirst({ where: { storeId: store1.id, name: 'Bebidas' } })) ||
    (await prisma.productCategory.create({ data: { storeId: store1.id, name: 'Bebidas', sortOrder: 1 } }));
  const pcPizzaPizzas =
    (await prisma.productCategory.findFirst({ where: { storeId: store1.id, name: 'Pizzas' } })) ||
    (await prisma.productCategory.create({ data: { storeId: store1.id, name: 'Pizzas', sortOrder: 2 } }));

  const existingPizzaProducts = await prisma.product.count({ where: { storeId: store1.id } });
  if (existingPizzaProducts === 0) {
    await prisma.product.createMany({
      data: [
        { storeId: store1.id, productCategoryId: pcPizzaBebidas.id, name: 'Refrigerante 2L', price: 10, sortOrder: 1 },
        { storeId: store1.id, productCategoryId: pcPizzaBebidas.id, name: 'Suco Natural 500ml', price: 12, sortOrder: 2 },
        { storeId: store1.id, productCategoryId: pcPizzaPizzas.id, name: 'Pizza Margherita', description: 'Molho, mussarela, tomate e manjericão', price: 45, sortOrder: 1 },
        { storeId: store1.id, productCategoryId: pcPizzaPizzas.id, name: 'Pizza Calabresa', description: 'Molho, mussarela e calabresa', price: 42, sortOrder: 2 },
        { storeId: store1.id, productCategoryId: pcPizzaPizzas.id, name: 'Pizza Frango c/ Catupiry', price: 48, sortOrder: 3 },
        { storeId: store1.id, productCategoryId: pcPizzaPizzas.id, name: 'Pizza Portuguesa', price: 50, sortOrder: 4 },
      ],
    });
  }

  const pcBurgerLanches =
    (await prisma.productCategory.findFirst({ where: { storeId: store2.id, name: 'Lanches' } })) ||
    (await prisma.productCategory.create({ data: { storeId: store2.id, name: 'Lanches', sortOrder: 1 } }));
  const pcBurgerBebidas =
    (await prisma.productCategory.findFirst({ where: { storeId: store2.id, name: 'Bebidas' } })) ||
    (await prisma.productCategory.create({ data: { storeId: store2.id, name: 'Bebidas', sortOrder: 2 } }));

  const existingBurgerProducts = await prisma.product.count({ where: { storeId: store2.id } });
  if (existingBurgerProducts === 0) {
    await prisma.product.createMany({
      data: [
        { storeId: store2.id, productCategoryId: pcBurgerLanches.id, name: 'X-Tudo', description: 'Hambúrguer, queijo, bacon, ovo, alface, tomate', price: 28, sortOrder: 1 },
        { storeId: store2.id, productCategoryId: pcBurgerLanches.id, name: 'X-Bacon', price: 22, sortOrder: 2 },
        { storeId: store2.id, productCategoryId: pcBurgerLanches.id, name: 'Batata Frita Média', price: 12, sortOrder: 3 },
        { storeId: store2.id, productCategoryId: pcBurgerBebidas.id, name: 'Refrigerante Lata', price: 6, sortOrder: 1 },
        { storeId: store2.id, productCategoryId: pcBurgerBebidas.id, name: 'Água 500ml', price: 4, sortOrder: 2 },
      ],
    });
  }
  const productsStore1 = await prisma.product.findMany({ where: { storeId: store1.id }, take: 4 });
  const productsStore2 = await prisma.product.findMany({ where: { storeId: store2.id }, take: 3 });
  console.log('Seed: produtos criados.');

  // 6. Pedidos com itens, entregas e pagamentos (apenas se ainda não existir)
  const productsStore1 = await prisma.product.findMany({ where: { storeId: store1.id }, take: 4 });
  const productsStore2 = await prisma.product.findMany({ where: { storeId: store2.id }, take: 3 });
  const hasOrders = (await prisma.order.count()) > 0;
  if (hasOrders) {
    console.log('Seed: pedidos já existem, pulando criação.');
  } else {
  // Pedido 1: Pizzaria, entregue, pago, com avaliação
  const order1 = await prisma.order.create({
    data: {
      customerId: customer.id,
      storeId: store1.id,
      driverId: driver1.id,
      addressId: addr1.id,
      status: 'DELIVERED',
      subtotal: 97,
      deliveryFee: 8.5,
      discount: 0,
      total: 105.5,
      paymentMethod: 'CREDIT_CARD',
      observations: 'Sem cebola na pizza',
      items: {
        create: [
          { productId: productsStore1[0].id, quantity: 2, unitPrice: 45 },
          { productId: productsStore1[1].id, quantity: 1, unitPrice: 12 },
        ],
      },
    },
    include: { items: true },
  });
  await prisma.delivery.create({
    data: {
      orderId: order1.id,
      driverId: driver1.id,
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      status: 'PAID',
      amount: 105.5,
      paymentMethod: 'CREDIT_CARD',
      paidAt: new Date(),
    },
  });
  await prisma.review.createMany({
    data: [
      { orderId: order1.id, userId: customer.id, storeId: store1.id, rating: 5, comment: 'Muito boa pizza!', type: 'store' },
      { orderId: order1.id, userId: customer.id, storeId: store1.id, rating: 5, type: 'driver' },
    ],
    skipDuplicates: true,
  });

  // Pedido 2: Burger, em preparação
  const order2 = await prisma.order.create({
    data: {
      customerId: customer.id,
      storeId: store2.id,
      addressId: addr1.id,
      status: 'PREPARING',
      subtotal: 50,
      deliveryFee: 6,
      discount: 0,
      total: 56,
      paymentMethod: 'PIX',
      items: {
        create: [
          { productId: productsStore2[0].id, quantity: 1, unitPrice: 28 },
          { productId: productsStore2[1].id, quantity: 1, unitPrice: 22 },
        ],
      },
    },
  });
  await prisma.delivery.create({
    data: { orderId: order2.id, status: 'PENDING_ACCEPTANCE' },
  });
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      status: 'PENDING',
      amount: 56,
      paymentMethod: 'PIX',
    },
  });

  // Pedido 3: Pizzaria, pendente
  const order3 = await prisma.order.create({
    data: {
      customerId: customer.id,
      storeId: store1.id,
      addressId: addr2.id,
      status: 'PENDING',
      subtotal: 90,
      deliveryFee: 8.5,
      discount: 0,
      total: 98.5,
      paymentMethod: 'CREDIT_CARD',
      items: {
        create: [
          { productId: productsStore1[2].id, quantity: 2, unitPrice: 45 },
        ],
      },
    },
  });
  await prisma.delivery.create({
    data: { orderId: order3.id, status: 'PENDING_ACCEPTANCE' },
  });
  await prisma.payment.create({
    data: {
      orderId: order3.id,
      status: 'PENDING',
      amount: 98.5,
      paymentMethod: 'CREDIT_CARD',
    },
  });

  console.log('Seed: pedidos, entregas, pagamentos e avaliações criados.');
  }

  // 7. Localização de um entregador (para rastreio)
  await prisma.driverLocation.upsert({
    where: { driverId: driver1.id },
    update: { latitude: -23.5505, longitude: -46.6333 },
    create: {
      driverId: driver1.id,
      latitude: -23.5505,
      longitude: -46.6333,
    },
  });

  console.log('Seed: concluído com sucesso.');
  console.log('---');
  console.log('Logins de teste (senha para todos: ' + TEST_PASSWORD + ')');
  console.log('  Cliente:    cliente@teste.com');
  console.log('  Entregador: entregador1@teste.com | entregador2@teste.com');
  console.log('  Loja:       loja@pizzaria.com | loja@burguer.com');
  console.log('  Admin:      admin@delivery.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
