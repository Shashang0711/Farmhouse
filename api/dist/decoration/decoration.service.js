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
exports.DecorationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decoration_entity_1 = require("./decoration.entity");
const farm_entity_1 = require("../farms/farm.entity");
let DecorationService = class DecorationService {
    constructor(decorationRepository, farmsRepository) {
        this.decorationRepository = decorationRepository;
        this.farmsRepository = farmsRepository;
    }
    async create(dto) {
        const farm = await this.farmsRepository.findOne({
            where: { id: dto.farmId }
        });
        if (!farm) {
            throw new common_1.NotFoundException('Farm not found');
        }
        const decoration = this.decorationRepository.create({
            name: dto.name,
            description: dto.description,
            price: dto.price,
            farm
        });
        return this.decorationRepository.save(decoration);
    }
    findAll() {
        return this.decorationRepository.find();
    }
    async findOne(id) {
        const decoration = await this.decorationRepository.findOne({
            where: { id }
        });
        if (!decoration) {
            throw new common_1.NotFoundException('Decoration not found');
        }
        return decoration;
    }
    async update(id, dto) {
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
    async remove(id) {
        const decoration = await this.findOne(id);
        await this.decorationRepository.remove(decoration);
    }
};
exports.DecorationService = DecorationService;
exports.DecorationService = DecorationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(decoration_entity_1.Decoration)),
    __param(1, (0, typeorm_1.InjectRepository)(farm_entity_1.Farm)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], DecorationService);
//# sourceMappingURL=decoration.service.js.map