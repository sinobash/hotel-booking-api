import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoomDto {
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    isAvailable: number;

    @IsNotEmpty()
    roomTypeId: number;

    @IsNotEmpty()
    floorNumber: number;

    @IsNotEmpty()
    bedType: string;

    @IsOptional()
    featureIds: number[];
}
