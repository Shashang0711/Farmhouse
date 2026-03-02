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
exports.PhotographyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const photography_entity_1 = require("./photography.entity");
const farm_entity_1 = require("../farms/farm.entity");
let PhotographyService = class PhotographyService {
    constructor(photographyRepository, farmsRepository) {
        this.photographyRepository = photographyRepository;
        this.farmsRepository = farmsRepository;
    }
    async create(dto) {
        const farm = await this.farmsRepository.findOne({
            where: { id: dto.farmId }
        });
        if (!farm) {
            throw new common_1.NotFoundException('Farm not found');
        }
        const photo = this.photographyRepository.create({
            title: dto.title,
            description: dto.description,
            imageUrl: dto.imageUrl,
            farm
        });
        return this.photographyRepository.save(photo);
    }
    findAll() {
        return this.photographyRepository.find();
    }
    async findOne(id) {
        const photo = await this.photographyRepository.findOne({ where: { id } });
        if (!photo) {
            throw new common_1.NotFoundException('Photography not found');
        }
        return photo;
    }
    async update(id, dto) {
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
    async remove(id) {
        const photo = await this.findOne(id);
        await this.photographyRepository.remove(photo);
    }
};
exports.PhotographyService = PhotographyService;
exports.PhotographyService = PhotographyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(photography_entity_1.Photography)),
    __param(1, (0, typeorm_1.InjectRepository)(farm_entity_1.Farm)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], PhotographyService);
//# sourceMappingURL=photography.service.js.map