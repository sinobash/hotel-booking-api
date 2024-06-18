import { IsISO8601, IsNotEmpty } from 'class-validator';

export class SearchRoomTypesReqDto {
    @IsNotEmpty()
    hotelId: number;

    @IsNotEmpty()
    @IsISO8601({
        strict: true,
    })
    startDate: string;

    @IsNotEmpty()
    @IsISO8601({
        strict: true,
    })
    endDate: string;
}

export class SearchRoomTypesResDto {
    roomTypeId: number;
    roomType: string;
    roomPrice: number;
    roomCount: number;
}

export class SearchRoomsReqDto {
    @IsNotEmpty()
    roomTypeId: number;

    @IsNotEmpty()
    @IsISO8601({
        strict: true,
    })
    startDate: string;

    @IsNotEmpty()
    @IsISO8601({
        strict: true,
    })
    endDate: string;
}

export class SearchRoomsResDto {
    roomId: number;
    roomCode: string;
}

export class SearchAvailableRoomReqDto {
    @IsNotEmpty()
    hotelId: number;

    @IsNotEmpty()
    // @IsISO8601({
    //     strict: true,
    // })
    startDate: string;

    @IsNotEmpty()
    // @IsISO8601({
    //     strict: true,
    // })
    endDate: string;
}

export class SearchAvailableRoomResDto {
    roomTypeId: number;
    roomTypeName: string;
    roomTypePrice: number;
    roomTypeCapacity: number;
    roomCount: number;
    bookedRooms: number;
    vacantRooms: number;
}

export class SearchOccupiedRoomReqDto {
    @IsNotEmpty()
    hotelId: number;

    @IsNotEmpty()
    // @IsISO8601({
    //     strict: true,
    // })
    startDate: string;

    @IsNotEmpty()
    // @IsISO8601({
    //     strict: true,
    // })
    endDate: string;
}

export class SearchOccupiedRoomResDto {
    bookedRoomId: number;
    bookingId: number;
    bookingCode: string;
    guestName: string;
    roomCode: string;
    roomTypeId: number;
    roomTypeName: string;
    startDate: Date;
    endDate: Date;
    status: string;
}
