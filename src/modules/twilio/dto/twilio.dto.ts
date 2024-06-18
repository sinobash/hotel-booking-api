import { IsNotEmpty, IsPhoneNumber, MaxLength } from 'class-validator';

export class CreateSmsDto {
    @IsNotEmpty()
    @MaxLength(64)
    @IsPhoneNumber()
    phoneNumber: string; // country phone code is mandatory included in phone number
}
