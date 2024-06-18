import { IsISO8601, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBillingReqDto {
    @IsNotEmpty()
    bookingCode: string;

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

    @IsNotEmpty()
    roomCount: number;

    @IsNotEmpty()
    totalPrice: number;

    @IsNotEmpty()
    @IsInt()
    hotelId: number;

    @IsNotEmpty()
    @IsInt()
    roomTypeId: number;

    @IsNotEmpty()
    @IsInt()
    guestId: number;

    @IsOptional()
    paymentId: string;

    @IsNotEmpty()
    status: string;
}
