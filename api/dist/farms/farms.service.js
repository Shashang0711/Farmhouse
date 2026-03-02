"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const farm_entity_1 = require("./farm.entity");
const user_entity_1 = require("../users/user.entity");
let FarmsService = class FarmsService {
    constructor(farmsRepository, usersRepository) {
        this.farmsRepository = farmsRepository;
        this.usersRepository = usersRepository;
    }
    async createMany(dto, ownerId) {
        const farmsToSave = [];
        for (const item of dto.farms) {
            const owner = await this.usersRepository.findOne({
                where: { id: ownerId }
            });
            if (!owner) {
                throw new common_1.NotFoundException(`Owner user not found for ownerId=${ownerId}`);
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
    findAll() {
        return this.farmsRepository.find();
    }
    async findOne(id) {
        const farm = await this.farmsRepository.findOne({ where: { id } });
        if (!farm) {
            throw new common_1.NotFoundException('Farm not found');
        }
        return farm;
    }
    async update(id, dto) {
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
    async remove(id) {
        const farm = await this.findOne(id);
        await this.farmsRepository.remove(farm);
    }
};
exports.FarmsService = FarmsService;
exports.FarmsService = FarmsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(farm_entity_1.Farm)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], FarmsService);
//# sourceMappingURL=farms.service.js.map