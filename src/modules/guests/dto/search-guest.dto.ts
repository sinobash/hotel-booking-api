import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SearchGuestDto {
    @IsNotEmpty()
    @MinLength(2)
    @IsEmail()
    email: string;

    @IsNotEmpty()
    fullName: string;
}
