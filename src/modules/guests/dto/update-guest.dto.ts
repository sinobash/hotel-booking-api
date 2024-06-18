import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestDto } from './create-guest.dto';
import { IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';

export class UpdateGuestDto extends PartialType(CreateGuestDto) {}

export class ChangeGuestNameDto {
    @IsOptional()
    userName: string;

    @IsNotEmpty()
    fullName: string;
}

export class SetupGuestPasswordDto {
    @IsOptional()
    userName: string;

    @IsNotEmpty()
    userPassword: string;
}

export class ChangeGuestPasswordDto {
    @IsOptional()
    userName: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    oldPassword: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    newPassword: string;
}
