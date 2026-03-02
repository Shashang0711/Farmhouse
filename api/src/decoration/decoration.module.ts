import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecorationController } from './decoration.controller';
import { DecorationService } from './decoration.service';
import { Decoration } from './decoration.entity';
import { Farm } from '../farms/farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Decoration, Farm])],
  controllers: [DecorationController],
  providers: [DecorationService]
})
export class DecorationModule {}

