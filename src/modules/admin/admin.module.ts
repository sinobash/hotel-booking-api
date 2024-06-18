import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AnonymousStrategy } from './guards/strategies/anonymous.strategy';
import { LocalStrategy } from './guards/strategies/local.strategy';
import { AdminJwtStrategy } from './guards/strategies/admin-jwt.strategy';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [ConfigModule, UsersModule, RolesModule, JwtModule.register({}), PassportModule, HotelsModule],
    providers: [AuthService, AnonymousStrategy, LocalStrategy, AdminJwtStrategy],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AdminModule {}
