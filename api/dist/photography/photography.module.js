"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotographyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const photography_service_1 = require("./photography.service");
const photography_controller_1 = require("./photography.controller");
const photography_entity_1 = require("./photography.entity");
const farm_entity_1 = require("../farms/farm.entity");
let PhotographyModule = class PhotographyModule {
};
exports.PhotographyModule = PhotographyModule;
exports.PhotographyModule = PhotographyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([photography_entity_1.Photography, farm_entity_1.Farm])],
        controllers: [photography_controller_1.PhotographyController],
        providers: [photography_service_1.PhotographyService]
    })
], PhotographyModule);
//# sourceMappingURL=photography.module.js.map