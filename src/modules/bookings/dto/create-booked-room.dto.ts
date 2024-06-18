import { IsNotEmpty } from 'class-validator';

export class CreateBookedRoomDto {
    @IsNotEmpty()
    roomId: number;
}
