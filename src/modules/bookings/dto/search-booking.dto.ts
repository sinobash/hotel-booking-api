import { IsISO8601, IsNotEmpty, IsOptional } from 'class-validator';

export class SearchBookingDto {
    @IsOptional()
    hotelId: number;

    @IsOptional()
    bookingCode: string;

    @IsOptional()
    guestName: string;

    @IsOptional()
    // @IsISO8601({
    //     strict: true,
    // })
    startDate: string;

    @IsOptional()
    // @IsISO8601({
    //     strict: true,
    // })
    endDate: string;
}

export class SearchOneBookingDto {
    @IsOptional()
    hotelId: number;

    @IsNotEmpty()
    code: string;
}

export class SearchBookingProgressDto {
    @IsOptional()
    guestId?: number;

    @IsNotEmpty()
    hotelId: number;

    @IsNotEmpty()
    roomId: number;

    @IsOptional()
    @IsISO8601({
        strict: true,
    })
    startDate: string;

    @IsOptional()
    @IsISO8601({
        strict: true,
    })
    endDate: string;
}

export class SearchAvailableRoomDto {
    @IsOptional()
    guestId?: number;

    @IsNotEmpty()
    hotelId: number;

    @IsNotEmpty()
    roomId: number;

    @IsOptional()
    @IsISO8601({
        strict: true,
    })
    startDate: string;

    @IsOptional()
    @IsISO8601({
        strict: true,
    })
    endDate: string;
}
