import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminJwtAuthGuard } from '@modules/admin/guards/admin-jwt-auth.guard';
import { RoleGuard } from '@modules/admin/guards/role.guard';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { SearchBookingDto } from '@modules/bookings/dto/search-booking.dto';
import { ResponseResultType } from '@common/types/response-result.type';

/**
 * Admin side dashboard controller
 */
@UseGuards(AdminJwtAuthGuard, RoleGuard)
@Controller({
    path: 'admin/dashboard',
})
export class AdminDashboardController {
    /**
     * @ignore
     */
    constructor(private readonly dashboardService: DashboardService) {}

    @Post('/overview')
    @HttpCode(HttpStatus.OK)
    async findOverview(
        @CurrentUser() currentUser: AdminUserData,
        @Body() searchDto: SearchBookingDto,
    ): Promise<ResponseResultType<any>> {
        searchDto.hotelId = currentUser.ubranch;
        const [overview] = await Promise.all([this.dashboardService.getAdminOverview(searchDto)]);
        return { data: { overview } };
    }
}
