import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Param,
    ParseIntPipe,
    Delete,
    Get,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingReqDto, CreateBookingResDto } from './dto/create-booking.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentGuest } from '@common/decorators/guest.decorator';
import { UserData } from '@common/interfaces/user-data.interface';
import { SearchAvailableRoomReqDto, SearchAvailableRoomResDto } from './dto/search-room.dto.';
import { BookingDetailResDto, StaysResDto, VaidateQrTokenDto, ValidateBookingDto } from './dto/booking.dto';
import { QrResponseType } from '@common/types/qr-response.type';

/**
 * Guest side banner controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'bookings',
})
export class BookingsController {
    /**
     * @ignore
     */
    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentGuest() guest: UserData,
        @Body() dto: CreateBookingReqDto,
    ): Promise<ResponseResultType<CreateBookingResDto>> {
        dto.guestId = guest.key;
        dto.roomCount = 1; // maximum 1 room for app v1
        const result = await this.bookingsService.createBilling(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @Get('/stays')
    async findStays(@CurrentGuest() principal: UserData): Promise<ResponseResultType<StaysResDto[]>> {
        const result = await this.bookingsService.findByGuestId(principal.key);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/stays/:id')
    async findStayById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<StaysResDto>> {
        const result = await this.bookingsService.findStayById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async cancel(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.bookingsService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }

    @Post('/search-rooms')
    @HttpCode(HttpStatus.OK)
    async findAvailableRooms(
        @Body() searchDto: SearchAvailableRoomReqDto,
    ): Promise<ResponseResultType<SearchAvailableRoomResDto[]>> {
        const result = await this.bookingsService.findAvailableRoomByHotelAndDate(searchDto);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/hotel/:id')
    @HttpCode(HttpStatus.OK)
    async findHotelDetail(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<any>> {
        const result = await this.bookingsService.findHotelDetail(id);
        return { data: result };
    }

    @Get('/room-type/:id')
    @HttpCode(HttpStatus.OK)
    async findRoomTypeDetail(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<any>> {
        const result = await this.bookingsService.findRoomTypeDetail(id);
        return { data: result };
    }

    @Post('/detail')
    async findBookingByCode(@Body() dto: ValidateBookingDto): Promise<ResponseResultType<BookingDetailResDto>> {
        const result = await this.bookingsService.findBookingDetailByCode(dto);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Post('/generate-qr-token')
    @HttpCode(HttpStatus.OK)
    async generateQrToken(@Body() dto: ValidateBookingDto): Promise<ResponseResultType<QrResponseType>> {
        const result = await this.bookingsService.generateQrToken(dto);
        return { data: result };
    }

    @Post('/validate-qr-token')
    @HttpCode(HttpStatus.OK)
    async validateQrToken(@Body() dto: VaidateQrTokenDto): Promise<ResponseResultType<any>> {
        const result = await this.bookingsService.validateQrToken(dto);
        const message = result ? 'Token is valid' : 'Token is invalid';
        return { data: result, message: message };
    }

    @Post('/cancel-qr-token')
    @HttpCode(HttpStatus.OK)
    async cancelQrToken(
        @CurrentGuest() CurrentGuest: UserData,
        @Body() dto: VaidateQrTokenDto,
    ): Promise<ResponseResultType<any>> {
        const result = await this.bookingsService.cancelQrToken(dto, CurrentGuest);
        const message = 'Success cancel token';
        return { data: result, message: message };
    }

    @Post('/checkin-room')
    @HttpCode(HttpStatus.OK)
    async checkinByGuest(@CurrentGuest() CurrentGuest: UserData, @Body() dto: { bookingCode: string }): Promise<any> {
        const result = await this.bookingsService.checkInRoomByGuest(dto.bookingCode, CurrentGuest);
        const message = 'Guest are ready to check in';
        return { data: result, message: message };
    }

    @Post('/checkout-room')
    @HttpCode(HttpStatus.OK)
    async checkoutByGuest(@CurrentGuest() CurrentGuest: UserData, @Body() dto: VaidateQrTokenDto): Promise<any> {
        const result = await this.bookingsService.checkOutRoomByGuest(dto, CurrentGuest);
        const message = 'Success checkout guest';
        return { data: result, message: message };
    }
}
