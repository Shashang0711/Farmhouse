import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

