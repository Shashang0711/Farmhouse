import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { PhotographyService } from './photography.service';
import { CreatePhotographyDto } from './dto/create-photography.dto';
import { UpdatePhotographyDto } from './dto/update-photography.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { RolesGuard } from '../common/roles.guard';

@Controller('photography')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhotographyController {
  constructor(private readonly photographyService: PhotographyService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Body() dto: CreatePhotographyDto) {
    return this.photographyService.create(dto);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.USER)
  findAll() {
    return this.photographyService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string) {
    return this.photographyService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePhotographyDto) {
    return this.photographyService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.photographyService.remove(id);
  }
}

