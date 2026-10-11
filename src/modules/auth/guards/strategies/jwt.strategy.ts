import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { OrNeverType } from '@common/types/or-never.type';
import { AUTH_MESSAGES } from '@common/constants/app.constants';
import { JwtPayloadType } from '@modules/auth/types/jwt-payload.type';
import UserError from '@common/errors/user.error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        });
    }

    validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
        if (!payload.sub) {
            throw new UserError(
                HttpStatus.UNAUTHORIZED,
                AUTH_MESSAGES.SESSION_EXPIRED,
                UserError.errors.SESSION_EXPIRED,
            );
        }
        return payload;
    }
}
