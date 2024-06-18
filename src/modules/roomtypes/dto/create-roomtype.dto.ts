import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateRoomTypeDto {
    @IsNotEmpty()
    hotelId: number;

    @IsNotEmpty()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    capacity: number;

    @IsOptional()
    featureIds: number[];
}
