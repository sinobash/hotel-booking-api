import { IsISO8601, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingReqDto {
    @IsNotEmpty()
    @IsInt()
    roomTypeId: number;

    @IsOptional()
    roomCount: number; // optional

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

    @IsOptional()
    guestId: number;
}

export class CreateBookingResDto {
    clientSecret: string;
    nextAction: any;
}
