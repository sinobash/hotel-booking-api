import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { NotificationsService } from './notifications.service';
import { ResponseResultType } from '@common/types/response-result.type';
import { Notification } from './entities/notification.entity';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { SearchNotificationDto } from './dto/search-notification.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side notification controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/notifications',
})
export class AdminNotificationsController {
    /**
     * @ignore
     */
    constructor(private readonly notificationsService: NotificationsService) {}

    @HasPermissions(Permission.ReadNotification)
    @Post('/q')
    @HttpCode(HttpStatus.OK)
    async findAllBy(@Query() pageOptionsDto: PageOptionsDto, @Body() searchDto: SearchNotificationDto) {
        return this.notificationsService.findAllBy(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadNotification)
    @Get()
    async findAll(@CurrentUser() currentUser: AdminUserData): Promise<ResponseResultType<Notification[]>> {
        const result = await this.notificationsService.findAllSpecificHotel(currentUser.ubranch_code);
        return { data: result };
    }
}
