import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { Booking } from './entities/booking.entity';
import { PageDto } from '@common/dto/page.dto';
import { SearchBookingDto, SearchOneBookingDto } from './dto/search-booking.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { validateAdminAccess } from '@common/utils/app.helper';
import { StripeService } from '@modules/stripe/stripe.service';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side booking controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/bookings',
})
export class AdminBookingsController {
    /**
     * @ignore
     */
    constructor(
        private readonly bookingsService: BookingsService,
        private readonly stripeService: StripeService,
    ) {}

    @HasPermissions(Permission.ReadBooking)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllByParams(
        @CurrentUser() currentUser: AdminUserData,
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchBookingDto,
    ): Promise<PageDto<any>> {
        searchDto.hotelId = currentUser.ubranch;
        return await this.bookingsService.findAllBooked(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadBooking)
    @Get(':code')
    @HttpCode(HttpStatus.OK)
    async findOneById(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneBookingDto,
    ): Promise<ResponseResultType<Booking>> {
        const booking = await this.bookingsService.findOne({ code: params.code });
        params.hotelId = booking.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.bookingsService.findByCode(params.code);
            const message = `booking with value ${result.code} has been found`;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadBooking)
    @HasRoles(RoleEnum.ADMIN)
    @Post('/stripe-event-logs')
    @HttpCode(HttpStatus.OK)
    async findStoredEvents(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<any>> {
        return await this.stripeService.findAllStoredEvents(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadBooking)
    @HasRoles(RoleEnum.ADMIN)
    @Post('/stripe-event-log')
    @HttpCode(HttpStatus.OK)
    async findOneEvent(@Body() payload: { eventId: string }): Promise<ResponseResultType<any>> {
        return await this.stripeService.retrieveEvent(payload.eventId);
    }

    @HasPermissions(Permission.ReadBooking)
    @HasRoles(RoleEnum.ADMIN)
    @Post('/payments')
    @HttpCode(HttpStatus.OK)
    async findPayments(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<any>> {
        return await this.stripeService.findAllPayments(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadBooking)
    @HasRoles(RoleEnum.ADMIN)
    @Post('/payment')
    @HttpCode(HttpStatus.OK)
    async findOnePayment(@Body() payload: { paymentId: string }): Promise<ResponseResultType<any>> {
        const result = await this.stripeService.retrievePayment(payload.paymentId);
        return { data: result };
    }

    @HasPermissions(Permission.AssignBooking)
    @Post('/assign-room')
    @HttpCode(HttpStatus.OK)
    async assignRoom(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { bookingCode: string; roomTypeId: number; roomId: number },
    ): Promise<ResponseResultType<any>> {
        const booking = await this.bookingsService.findOne({ code: payload.bookingCode });
        const hotelId = booking ? booking.hotel.id : 0;
        if (validateAdminAccess(currentUser, hotelId)) {
            const result = await this.bookingsService.assignRoomByAdmin(
                payload.bookingCode,
                payload.roomTypeId,
                payload.roomId,
            );
            return { data: result };
        }
    }

    @HasPermissions(Permission.AssignBooking)
    @Post('/checkin-room')
    @HttpCode(HttpStatus.OK)
    async checkInRoom(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { bookingCode: string; roomTypeId: number; roomId: number },
    ): Promise<ResponseResultType<any>> {
        const booking = await this.bookingsService.findOne({ code: payload.bookingCode });
        const hotelId = booking ? booking.hotel.id : 0;
        if (validateAdminAccess(currentUser, hotelId)) {
            const result = await this.bookingsService.checkInRoomByAdmin(
                payload.bookingCode,
                payload.roomTypeId,
                payload.roomId,
            );
            return { data: result };
        }
    }

    @HasPermissions(Permission.UpdateBooking)
    @Post('/checkout-room')
    @HttpCode(HttpStatus.OK)
    async checkOutRoom(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { bookingCode: string; roomTypeId: number; roomId: number },
    ): Promise<ResponseResultType<any>> {
        const booking = await this.bookingsService.findOne({ code: payload.bookingCode });
        const hotelId = booking ? booking.hotel.id : 0;
        if (validateAdminAccess(currentUser, hotelId)) {
            const result = await this.bookingsService.checkOutRoomByAdmin(
                payload.bookingCode,
                payload.roomTypeId,
                payload.roomId,
            );
            return { data: result };
        }
    }
}
