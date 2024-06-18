import Permission from '@modules/roles/enums/permission.type';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { SocketAuthGuard } from '../guards/socket-auth.guard';

/**
 * A role permission check on websocket decorator
 */
export const SocketHasPermissions = (permissions: Permission) =>
    applyDecorators(UseGuards(SocketAuthGuard), SetMetadata('socket_permissions', permissions));
