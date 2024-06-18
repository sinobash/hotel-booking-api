import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import Permission from '@modules/roles/enums/permission.type';
import { RolesService } from '@modules/roles/roles.service';
import { AUTH_MESSAGES } from '@common/constants/app.constants';
import { JwtPayloadType } from '../types/jwt-payload.type';

@Injectable()
export class SocketAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private logger: Logger,
        private readonly configService: ConfigService,
        private readonly adminAuthService: AuthService,
        private readonly rolesService: RolesService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let user: JwtPayloadType;
        try {
            const requiredPermissions = this.reflector.getAllAndOverride<Permission>('socket_permissions', [
                context.getHandler(),
                context.getClass(),
            ]);
            if (!requiredPermissions) {
                return true; // No permission is specified, allow access by default
            }

            const client: Socket = context.switchToWs().getClient();
            const bearerToken: string = client.handshake.headers.authorization?.split(' ')[1];
            user = this.adminAuthService.verifyUser(bearerToken);

            if (user.uid === Number(this.configService.get('app.rootKey'))) {
                return true; // Allow all permissions to user with root key
            }
            const rolePemissions: any = user.urole
                ? (await this.rolesService.findPermissionByAlias(user.urole)).capabilities
                : [];
            const roleActions = rolePemissions
                ? Object.keys(rolePemissions).flatMap((key: any) =>
                      rolePemissions[key].map((v: string) => key.concat('.').concat(v)),
                  )
                : [];
            return roleActions.length > 0 ? roleActions.includes(requiredPermissions) : false;
        } catch (error) {
            this.logger.error(error);
            throw new WsException({
                message: AUTH_MESSAGES.SESSION_EXPIRED,
            });
        }
    }
}
