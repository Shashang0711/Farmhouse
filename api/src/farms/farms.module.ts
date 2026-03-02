import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { Farm } from './farm.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Farm, User])],
  controllers: [FarmsController],
  providers: [FarmsService]
})
export class FarmsModule {}

