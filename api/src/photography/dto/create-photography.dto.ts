import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePhotographyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  farmId: string;
}

