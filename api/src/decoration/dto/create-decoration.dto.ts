import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDecorationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsNotEmpty()
  farmId: string;
}

