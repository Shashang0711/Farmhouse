import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from './farm.entity';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { BulkCreateFarmDto } from './dto/bulk-create-farm.dto';
import { User } from '../users/user.entity';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmsRepository: Repository<Farm>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async createMany(dto: BulkCreateFarmDto, ownerId: string): Promise<Farm[]> {
    const farmsToSave: Farm[] = [];

    for (const item of dto.farms) {
      const owner = await this.usersRepository.findOne({
        where: { id: ownerId }
      });
      if (!owner) {
        throw new NotFoundException(
          `Owner user not found for ownerId=${ownerId}`
        );
      }
      const farm = this.farmsRepository.create({
        name: item.name,
        location: item.location,
        description: item.description,
        owner
      });
      farmsToSave.push(farm);
    }

    return this.farmsRepository.save(farmsToSave);
  }

  findAll(): Promise<Farm[]> {
    return this.farmsRepository.find();
  }

  async findOne(id: string): Promise<Farm> {
    const farm = await this.farmsRepository.findOne({ where: { id } });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    return farm;
  }

  async update(id: string, dto: UpdateFarmDto): Promise<Farm> {
    const farm = await this.findOne(id);
    if (dto.name !== undefined) {
      farm.name = dto.name;
    }
    if (dto.location !== undefined) {
      farm.location = dto.location;
    }
    if (dto.description !== undefined) {
      farm.description = dto.description;
    }
    return this.farmsRepository.save(farm);
  }

  async remove(id: string): Promise<void> {
    const farm = await this.findOne(id);
    await this.farmsRepository.remove(farm);
  }
}

