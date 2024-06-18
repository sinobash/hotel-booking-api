import { AUTH_MESSAGES } from '@common/constants/app.constants';
import { doCompare } from '@common/utils/crypt.helper';
import { UsersService } from '@modules/users/users.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthEmailLoginDto } from './dto/auth.dto';
import { LoginResponseType } from './types/login-response.type';
import { User } from '@modules/users/entities/user.entity';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { ActivationEnum } from '@common/enums/status.enum';
import { JwtPayloadType } from './types/jwt-payload.type';
import { OrNeverType } from '@common/types/or-never.type';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import UserError from '@common/errors/user.error';
import AuthenticationError from '@common/errors/authentication.error';

@Injectable()
export class AuthService {
    /**
     * @ignore
     */
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        // validate an active user
        const user = await this.usersService.findUsername({
            username: username,
            isActive: ActivationEnum.ACTIVE,
        });
        if (!user) {
            throw new UserError(HttpStatus.UNAUTHORIZED, `The username is invalid`, UserError.errors.INVALID_USER_NAME);
        }

        const isValidPassword = await doCompare(pass, user.codeWord);

        if (!isValidPassword) {
            throw new AuthenticationError(
                HttpStatus.UNAUTHORIZED,
                AUTH_MESSAGES.INVALID_CREDENTIALS,
                AuthenticationError.errors.INVALID_CREDENTIALS,
            );
        }
        return user;
    }

    async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseType> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const { accessToken } = await this.getTokensData({
            user: user,
            role: user.role,
        });
        // update user last login
        await this.usersService.updateLastLogin(user);
        return {
            accessToken,
        };
    }

    private async getTokensData(data: { user: Pick<User, 'id' | 'username' | 'hotel'>; role: User['role'] }) {
        const tokenExpiresIn = this.configService.get<string>('jwt.expires');
        let branch = 0;
        let branch_code = 'HQ';
        // if user is not assigned to specific hotel then set branch code to HQ
        if (data.user.id !== Number(this.configService.get('app.rootKey'))) {
            if (data.role.alias.toLowerCase() !== RoleEnum.ADMIN) {
                branch = data.user.hotel ? data.user.hotel.id : 0;
                branch_code = data.user.hotel ? data.user.hotel.code : null;
            }
        }
        const [accessToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    umail: data.user.username,
                    uid: data.user.id,
                    urole: data.role.alias.toLowerCase(),
                    ubranch: branch,
                    ubranch_code: branch_code,
                } as AdminUserData,
                {
                    secret: this.configService.getOrThrow('jwt.secret'),
                    expiresIn: tokenExpiresIn,
                },
            ),
        ]);
        return {
            accessToken,
        };
    }

    verifyUser(token: string): OrNeverType<JwtPayloadType> {
        // verify jwt token
        const payload: JwtPayloadType = this.jwtService.verify(token, {
            secret: this.configService.getOrThrow('jwt.secret'),
        });
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
