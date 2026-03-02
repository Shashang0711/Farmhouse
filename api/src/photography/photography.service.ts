import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photography } from './photography.entity';
import { CreatePhotographyDto } from './dto/create-photography.dto';
import { UpdatePhotographyDto } from './dto/update-photography.dto';
import { Farm } from '../farms/farm.entity';

@Injectable()
export class PhotographyService {
  constructor(
    @InjectRepository(Photography)
    private readonly photographyRepository: Repository<Photography>,
    @InjectRepository(Farm)
    private readonly farmsRepository: Repository<Farm>
  ) {}

  async create(dto: CreatePhotographyDto): Promise<Photography> {
    const farm = await this.farmsRepository.findOne({
      where: { id: dto.farmId }
    });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    const photo = this.photographyRepository.create({
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      farm
    });
    return this.photographyRepository.save(photo);
  }

  findAll(): Promise<Photography[]> {
    return this.photographyRepository.find();
  }

  async findOne(id: string): Promise<Photography> {
    const photo = await this.photographyRepository.findOne({ where: { id } });
    if (!photo) {
      throw new NotFoundException('Photography not found');
    }
    return photo;
  }

  async update(id: string, dto: UpdatePhotographyDto): Promise<Photography> {
    const photo = await this.findOne(id);
    if (dto.title !== undefined) {
      photo.title = dto.title;
    }
    if (dto.description !== undefined) {
      photo.description = dto.description;
    }
    if (dto.imageUrl !== undefined) {
      photo.imageUrl = dto.imageUrl;
    }
    return this.photographyRepository.save(photo);
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    await this.photographyRepository.remove(photo);
  }
}

