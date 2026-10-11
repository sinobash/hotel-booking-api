import { BookingStatus } from '@common/enums/status.enum';
import { toISOEndOfDay, toISOStartOfDay } from '@common/utils/cast.helper';
import { BookingsService } from '@modules/bookings/bookings.service';
import { SearchBookingDto } from '@modules/bookings/dto/search-booking.dto';
import {
    SearchAvailableRoomReqDto,
    SearchOccupiedRoomReqDto,
    SearchOccupiedRoomResDto,
    SearchRoomTypesResDto,
} from '@modules/bookings/dto/search-room.dto.';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DashboardService {
    private readonly className: string = 'dashboard';
    constructor(private readonly bookingsService: BookingsService) {}

    async findTodayOverview(searchDto: SearchBookingDto): Promise<any> {
        searchDto.startDate = toISOStartOfDay(searchDto.startDate);
        searchDto.endDate = toISOEndOfDay(searchDto.endDate);
        const bookings = await this.bookingsService.findAll(searchDto);

        const newBookings = bookings.filter((booking: any) => booking.bookingstatus === BookingStatus.BOOKED);
        const dueInBookings = bookings.filter((booking: any) => {
            if (booking.bookingstatus === BookingStatus.BOOKED) {
                const dueInTime = DateTime.fromJSDate(booking.startdate).diff(DateTime.now(), 'hours').toObject();
                return dueInTime.hours <= 6;
            }
        }).length;
        const dueOutBookings = bookings.filter((booking: any) => {
            if (booking.bookingstatus === BookingStatus.CHECKEDIN) {
                const dueInTime = DateTime.fromJSDate(booking.enddate).diff(DateTime.now(), 'hours').toObject();
                return dueInTime.hours <= 2;
            }
        }).length;

        const searchAvailableRoomDto: SearchAvailableRoomReqDto = {
            hotelId: searchDto.hotelId,
            startDate: searchDto.startDate,
            endDate: searchDto.endDate,
        };

        const getAvailableRooms = await this.findAvailableRooms(searchAvailableRoomDto);

        const todayOverview = {
            newBookings: newBookings,
            dueInBookings: dueInBookings,
            dueOutBookings: dueOutBookings,
            availableRooms: getAvailableRooms,
            occupiedRooms: 0,
        };

        return todayOverview;
    }

    async getAdminOverview(searchDto: SearchBookingDto): Promise<any> {
        searchDto.startDate = toISOStartOfDay(searchDto.startDate);
        searchDto.endDate = toISOEndOfDay(searchDto.endDate);
        const getBookings = await this.bookingsService.findAll(searchDto);

        const searchAvailableRoomDto: SearchAvailableRoomReqDto = {
            hotelId: searchDto.hotelId,
            startDate: searchDto.startDate,
            endDate: searchDto.endDate,
        };

        const getAvailableRooms = await this.findAvailableRooms(searchAvailableRoomDto);

        const searchOccupiedRoomDto: SearchOccupiedRoomReqDto = {
            hotelId: searchDto.hotelId,
            startDate: searchDto.startDate,
            endDate: searchDto.endDate,
        };

        const getOccupiedRooms = await this.findOccupiedRooms(searchOccupiedRoomDto);

        const overview = {
            bookings: getBookings,
            availableRooms: getAvailableRooms,
            occupiedRooms: getOccupiedRooms,
        };

        return overview;
    }

    async findAvailableRooms(searchDto: SearchAvailableRoomReqDto): Promise<SearchRoomTypesResDto[]> {
        searchDto.startDate = toISOStartOfDay(searchDto.startDate);
        searchDto.endDate = toISOEndOfDay(searchDto.endDate);
        return await this.bookingsService.findAvailableRooms(searchDto);
    }

    async findOccupiedRooms(searchDto: SearchOccupiedRoomReqDto): Promise<SearchOccupiedRoomResDto[]> {
        searchDto.startDate = toISOStartOfDay(searchDto.startDate);
        searchDto.endDate = toISOEndOfDay(searchDto.endDate);
        return await this.bookingsService.findOccupiedRooms(searchDto);
    }
}
