import Permission from '@modules/roles/enums/permission.type';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';

/**
 * A role permission check decorator
 */
export const HasPermissions = (permissions: Permission) =>
    applyDecorators(UseGuards(AdminJwtAuthGuard, RoleGuard, PermissionGuard), SetMetadata('permissions', permissions));
