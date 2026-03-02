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
exports.DecorationController = void 0;
const common_1 = require("@nestjs/common");
const decoration_service_1 = require("./decoration.service");
const create_decoration_dto_1 = require("./dto/create-decoration.dto");
const update_decoration_dto_1 = require("./dto/update-decoration.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_enum_1 = require("../common/roles.enum");
const roles_guard_1 = require("../common/roles.guard");
let DecorationController = class DecorationController {
    constructor(decorationService) {
        this.decorationService = decorationService;
    }
    create(dto) {
        return this.decorationService.create(dto);
    }
    findAll() {
        return this.decorationService.findAll();
    }
    findOne(id) {
        return this.decorationService.findOne(id);
    }
    update(id, dto) {
        return this.decorationService.update(id, dto);
    }
    remove(id) {
        return this.decorationService.remove(id);
    }
};
exports.DecorationController = DecorationController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_decoration_dto_1.CreateDecorationDto]),
    __metadata("design:returntype", void 0)
], DecorationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN, roles_enum_1.Role.USER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DecorationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN, roles_enum_1.Role.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecorationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_decoration_dto_1.UpdateDecorationDto]),
    __metadata("design:returntype", void 0)
], DecorationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecorationController.prototype, "remove", null);
exports.DecorationController = DecorationController = __decorate([
    (0, common_1.Controller)('decorations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [decoration_service_1.DecorationService])
], DecorationController);
//# sourceMappingURL=decoration.controller.js.map