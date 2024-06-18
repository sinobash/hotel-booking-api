import { HouseKeepingStatus } from '@common/enums/status.enum';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class SearchRoomDto {
    @IsOptional()
    hotelId: number;

    @IsOptional()
    roomTypeId: number;

    @IsOptional()
    code: string;

    @IsOptional()
    roomFloor: number;

    @IsOptional()
    bedType: string;

    @IsOptional()
    @IsEnum(HouseKeepingStatus)
    houseKeepingStatus: HouseKeepingStatus;

    @IsOptional()
    isAvailable: number;
}

export class SearchOneRoomDto {
    @IsOptional()
    hotelId: number;

    @IsOptional()
    roomTypeId: number;

    @IsNotEmpty()
    @IsNumberString()
    roomId: number;
}
