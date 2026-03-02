"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const decoration_controller_1 = require("./decoration.controller");
const decoration_service_1 = require("./decoration.service");
const decoration_entity_1 = require("./decoration.entity");
const farm_entity_1 = require("../farms/farm.entity");
let DecorationModule = class DecorationModule {
};
exports.DecorationModule = DecorationModule;
exports.DecorationModule = DecorationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([decoration_entity_1.Decoration, farm_entity_1.Farm])],
        controllers: [decoration_controller_1.DecorationController],
        providers: [decoration_service_1.DecorationService]
    })
], DecorationModule);
//# sourceMappingURL=decoration.module.js.map