import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { User } from './users/user.entity';
import { Role } from './common/roles.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(User);
  const existingOwner = await userRepo.findOne({
    where: { role: Role.OWNER }
  });
  if (!existingOwner) {
    const passwordHash = await bcrypt.hash('owner123', 10);
    const owner = userRepo.create({
      email: 'owner@farmhouse.local',
      name: 'Default Owner',
      password: passwordHash,
      role: Role.OWNER
    });
    await userRepo.save(owner);
    // eslint-disable-next-line no-console
    console.log(
      'Seeded default Owner user:',
      'email=owner@farmhouse.local',
      'password=owner123'
    );
  }

  await app.listen(3000);
}

bootstrap();
