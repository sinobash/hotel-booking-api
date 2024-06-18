import { lowerCaseTransformer } from '@common/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsPhoneNumber, Matches, MaxLength, MinLength } from 'class-validator';

export class CheckEmailDto {
    @IsNotEmpty()
    @IsEmail()
    @Transform(lowerCaseTransformer)
    email: string;
}

export class SendOtpEmailDto {
    @IsNotEmpty()
    @IsEmail()
    @Transform(lowerCaseTransformer)
    email: string;
}

export class RegisterByEmailOtpDto {
    @IsNotEmpty()
    @IsEmail()
    @Transform(lowerCaseTransformer)
    email: string;

    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(4)
    code: string;

    @IsNotEmpty()
    @MinLength(3)
    fullName: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    password: string;
}

export class CheckMobileNumberDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    mobileNumber: string;
}

export class SendOtpMobileNumberDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    mobileNumber: string;
}

export class RegisterByMobileDto {
    @IsNotEmpty()
    @MaxLength(64)
    @IsPhoneNumber()
    mobileNumber: string; // country phone code is mandatory included in mobile number

    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(4)
    code: string;

    @IsNotEmpty()
    @MinLength(3)
    fullName: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    password: string;
}
