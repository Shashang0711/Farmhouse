import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request
} from '@nestjs/common';
import { FarmsService } from './farms.service';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { BulkCreateFarmDto } from './dto/bulk-create-farm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { RolesGuard } from '../common/roles.guard';

@Controller('farms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Request() req: any, @Body() dto: BulkCreateFarmDto) {
    const ownerId: string = req.user.id;
    return this.farmsService.createMany(dto, ownerId);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.USER)
  findAll() {
    return this.farmsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateFarmDto) {
    return this.farmsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.farmsService.remove(id);
  }
}

