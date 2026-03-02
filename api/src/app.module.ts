import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FarmsModule } from './farms/farms.module';
import { PhotographyModule } from './photography/photography.module';
import { DecorationModule } from './decoration/decoration.module';
import { User } from './users/user.entity';
import { Farm } from './farms/farm.entity';
import { Photography } from './photography/photography.entity';
import { Decoration } from './decoration/decoration.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'farmhouse',
      entities: [User, Farm, Photography, Decoration],
      synchronize: true
    }),
    AuthModule,
    UsersModule,
    FarmsModule,
    PhotographyModule,
    DecorationModule
  ]
})
export class AppModule {}

