import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GuestsModule } from '@modules/guests/guests.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '@modules/redis/redis.module';
import { MailModule } from '@modules/mail/mail.module';
import { TwilioModule } from '@modules/twilio/twilio.module';
import { AnonymousStrategy } from './guards/strategies/anonymous.strategy';
import { JwtStrategy } from './guards/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        GuestsModule,
        JwtModule.register({}),
        PassportModule,
        RedisModule,
        MailModule,
        TwilioModule,
    ],
    providers: [Logger, AuthService, AnonymousStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [],
})
export class AuthModule {}
