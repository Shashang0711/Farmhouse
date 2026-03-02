"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const farms_module_1 = require("./farms/farms.module");
const photography_module_1 = require("./photography/photography.module");
const decoration_module_1 = require("./decoration/decoration.module");
const user_entity_1 = require("./users/user.entity");
const farm_entity_1 = require("./farms/farm.entity");
const photography_entity_1 = require("./photography/photography.entity");
const decoration_entity_1 = require("./decoration/decoration.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 5432,
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'farmhouse',
                entities: [user_entity_1.User, farm_entity_1.Farm, photography_entity_1.Photography, decoration_entity_1.Decoration],
                synchronize: true
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            farms_module_1.FarmsModule,
            photography_module_1.PhotographyModule,
            decoration_module_1.DecorationModule
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map