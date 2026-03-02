import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Decoration } from './decoration.entity';
import { CreateDecorationDto } from './dto/create-decoration.dto';
import { UpdateDecorationDto } from './dto/update-decoration.dto';
import { Farm } from '../farms/farm.entity';

@Injectable()
export class DecorationService {
  constructor(
    @InjectRepository(Decoration)
    private readonly decorationRepository: Repository<Decoration>,
    @InjectRepository(Farm)
    private readonly farmsRepository: Repository<Farm>
  ) {}

  async create(dto: CreateDecorationDto): Promise<Decoration> {
    const farm = await this.farmsRepository.findOne({
      where: { id: dto.farmId }
    });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    const decoration = this.decorationRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      farm
    });
    return this.decorationRepository.save(decoration);
  }

  findAll(): Promise<Decoration[]> {
    return this.decorationRepository.find();
  }

  async findOne(id: string): Promise<Decoration> {
    const decoration = await this.decorationRepository.findOne({
      where: { id }
    });
    if (!decoration) {
      throw new NotFoundException('Decoration not found');
    }
    return decoration;
  }

  async update(id: string, dto: UpdateDecorationDto): Promise<Decoration> {
    const decoration = await this.findOne(id);
    if (dto.name !== undefined) {
      decoration.name = dto.name;
    }
    if (dto.description !== undefined) {
      decoration.description = dto.description;
    }
    if (dto.price !== undefined) {
      decoration.price = dto.price;
    }
    return this.decorationRepository.save(decoration);
  }

  async remove(id: string): Promise<void> {
    const decoration = await this.findOne(id);
    await this.decorationRepository.remove(decoration);
  }
}

