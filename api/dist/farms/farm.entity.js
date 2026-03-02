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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Farm = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const photography_entity_1 = require("../photography/photography.entity");
const decoration_entity_1 = require("../decoration/decoration.entity");
let Farm = class Farm {
};
exports.Farm = Farm;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Farm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Farm.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Farm.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Farm.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.farms, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], Farm.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => photography_entity_1.Photography, (photo) => photo.farm),
    __metadata("design:type", Array)
], Farm.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => decoration_entity_1.Decoration, (decoration) => decoration.farm),
    __metadata("design:type", Array)
], Farm.prototype, "decorations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Farm.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Farm.prototype, "updatedAt", void 0);
exports.Farm = Farm = __decorate([
    (0, typeorm_1.Entity)()
], Farm);
//# sourceMappingURL=farm.entity.js.map