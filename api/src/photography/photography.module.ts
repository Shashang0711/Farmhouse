import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotographyService } from './photography.service';
import { PhotographyController } from './photography.controller';
import { Photography } from './photography.entity';
import { Farm } from '../farms/farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photography, Farm])],
  controllers: [PhotographyController],
  providers: [PhotographyService]
})
export class PhotographyModule {}

