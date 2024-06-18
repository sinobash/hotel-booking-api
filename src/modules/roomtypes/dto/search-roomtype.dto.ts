import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class SearchRoomTypeDto {
    @IsOptional()
    hotelId: number;

    @IsOptional()
    name: string;
}

export class SearchOneRoomTypeDto {
    @IsOptional()
    hotelId: number;

    @IsNotEmpty()
    roomTypeId: number;
}
