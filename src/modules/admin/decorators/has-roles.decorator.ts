import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';

/**
 * A role check decorator
 */
export const HasRoles = (...roles: RoleEnum[]) =>
    applyDecorators(UseGuards(AdminJwtAuthGuard, RoleGuard), SetMetadata('roles', roles));
