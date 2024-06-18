import { VALIDATION_MESSAGES } from '@common/constants/app.constants';
import { lowerCaseTransformer } from '@common/transformers/lower-case.transformer';
import { IsNotExist } from '@common/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    Matches,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';

export class CreateGuestDto {
    @IsOptional()
    @IsEmail()
    @Transform(lowerCaseTransformer)
    @Validate(IsNotExist, ['Guest', 'email'], {
        // if email already exists then throw error
        message: VALIDATION_MESSAGES.EMAIL_NOT_AVAILABLE,
    })
    email: string;

    @IsOptional()
    @MaxLength(64)
    @Validate(IsNotExist, ['Guest', 'phoneNumber'], {
        // if phoneNumber already exists then throw error
        message: VALIDATION_MESSAGES.PHONE_NUMBER_NOT_AVAILABLE,
    })
    @IsPhoneNumber()
    phoneNumber: string; // country phone code is mandatory included in phone number

    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @IsNotEmpty()
    @MinLength(3)
    fullName: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    password: string;
}

export class CreateGuestByEmailDto {
    @IsNotEmpty()
    @MinLength(3)
    fullName: string;

    @IsNotEmpty()
    @IsEmail()
    @Transform(lowerCaseTransformer)
    @Validate(IsNotExist, ['Guest', 'email'], {
        // if email already exists then throw error
        message: VALIDATION_MESSAGES.EMAIL_NOT_AVAILABLE,
    })
    email: string;
}

export class CreateGuestByPhoneDto {
    @IsNotEmpty()
    @MinLength(3)
    fullName: string;

    @IsNotEmpty()
    @MaxLength(64)
    @Validate(IsNotExist, ['Guest', 'phoneNumber'], {
        // if phoneNumber already exists then throw error
        message: VALIDATION_MESSAGES.PHONE_NUMBER_NOT_AVAILABLE,
    })
    @IsPhoneNumber()
    phoneNumber: string; // country phone code is mandatory included in phone number
}
