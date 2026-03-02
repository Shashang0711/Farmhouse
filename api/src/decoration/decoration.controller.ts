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
import { DecorationService } from './decoration.service';
import { CreateDecorationDto } from './dto/create-decoration.dto';
import { UpdateDecorationDto } from './dto/update-decoration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { RolesGuard } from '../common/roles.guard';

@Controller('decorations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DecorationController {
  constructor(private readonly decorationService: DecorationService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Body() dto: CreateDecorationDto) {
    return this.decorationService.create(dto);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.USER)
  findAll() {
    return this.decorationService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string) {
    return this.decorationService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDecorationDto) {
    return this.decorationService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.decorationService.remove(id);
  }
}

