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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotographyController = void 0;
const common_1 = require("@nestjs/common");
const photography_service_1 = require("./photography.service");
const create_photography_dto_1 = require("./dto/create-photography.dto");
const update_photography_dto_1 = require("./dto/update-photography.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_enum_1 = require("../common/roles.enum");
const roles_guard_1 = require("../common/roles.guard");
let PhotographyController = class PhotographyController {
    constructor(photographyService) {
        this.photographyService = photographyService;
    }
    create(dto) {
        return this.photographyService.create(dto);
    }
    findAll() {
        return this.photographyService.findAll();
    }
    findOne(id) {
        return this.photographyService.findOne(id);
    }
    update(id, dto) {
        return this.photographyService.update(id, dto);
    }
    remove(id) {
        return this.photographyService.remove(id);
    }
};
exports.PhotographyController = PhotographyController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_photography_dto_1.CreatePhotographyDto]),
    __metadata("design:returntype", void 0)
], PhotographyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN, roles_enum_1.Role.USER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PhotographyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN, roles_enum_1.Role.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotographyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_photography_dto_1.UpdatePhotographyDto]),
    __metadata("design:returntype", void 0)
], PhotographyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotographyController.prototype, "remove", null);
exports.PhotographyController = PhotographyController = __decorate([
    (0, common_1.Controller)('photography'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [photography_service_1.PhotographyService])
], PhotographyController);
//# sourceMappingURL=photography.controller.js.map