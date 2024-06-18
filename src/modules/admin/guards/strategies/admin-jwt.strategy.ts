import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { OrNeverType } from '@common/types/or-never.type';
import { JwtPayloadType } from '@modules/admin/types/jwt-payload.type';
import { AUTH_MESSAGES } from '@common/constants/app.constants';
import UserError from '@common/errors/user.error';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        });
    }

    validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
        if (!payload.umail && !payload.urole) {
            throw new UserError(
                HttpStatus.UNAUTHORIZED,
                AUTH_MESSAGES.SESSION_EXPIRED,
                UserError.errors.SESSION_EXPIRED,
            );
        }
        return payload;
    }
}
