import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Delivery API')
    .setDescription('API do sistema de delivery (estilo iFood) – consumidor, entregador e portal da loja')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .addTag('auth', 'Registro, login e sessão')
    .addTag('users', 'Perfil do usuário')
    .addTag('addresses', 'Endereços')
    .addTag('categories', 'Categorias de lojas')
    .addTag('stores', 'Lojas/restaurantes')
    .addTag('products', 'Produtos e categorias do cardápio')
    .addTag('orders', 'Pedidos')
    .addTag('deliveries', 'Entregas (entregador)')
    .addTag('payments', 'Pagamentos')
    .addTag('reviews', 'Avaliações')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
