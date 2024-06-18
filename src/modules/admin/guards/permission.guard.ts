import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '@modules/roles/roles.service';
import Permission from '@modules/roles/enums/permission.type';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly configService: ConfigService,
        private readonly rolesService: RolesService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission>('permissions', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions) {
            return true; // No permission is specified, allow access by default
        }
        const { user } = context.switchToHttp().getRequest();
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
    }
}
