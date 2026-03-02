import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  ValidateNested
} from 'class-validator';
import { CreateFarmDto } from './create-farm.dto';

export class BulkCreateFarmDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFarmDto)
  farms: CreateFarmDto[];
}

