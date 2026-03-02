import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(creatorRole: Role, dto: CreateUserDto): Promise<User> {
    if (![Role.OWNER, Role.ADMIN].includes(creatorRole)) {
      throw new ForbiddenException('Only Owner or Admin can create users');
    }

    const existing = await this.usersRepository.findOne({
      where: { email: dto.email }
    });
    if (existing) {
      throw new ForbiddenException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      password: passwordHash,
      role: dto.role
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.password !== undefined) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}

