import { IsNotEmpty } from 'class-validator';

export class ValidateBookingDto {
    @IsNotEmpty()
    code: string;
}

export class VaidateQrTokenDto {
    @IsNotEmpty()
    qrToken: string;
}

export class StaysResDto {
    bookingCode: string;
    bookedRoomId: number;
    hotelName: string;
    cityName: string;
    roomTypeName: string;
    roomCount: number;
    checkInDate: string;
    checkOutDate: string;
    bookingStatus: string;
}

export class BookingDetailResDto {
    bookingCode: string;
    checkInDate: string;
    checkOutDate: string;
    bookingStatus: string;
}
