import { VALIDATION_MESSAGES } from '@common/constants/app.constants';
import { lowerCaseTransformer } from '@common/transformers/lower-case.transformer';
import { IsNotExist } from '@common/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, MinLength, Validate } from 'class-validator';

export class CreateAccountDto {
    @Transform(lowerCaseTransformer)
    @IsNotEmpty()
    @Validate(IsNotExist, ['User', 'email'], {
        // if email already exists then throw error
        message: VALIDATION_MESSAGES.EMAIL_NOT_AVAILABLE,
    })
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsNotEmpty()
    fullName: string;

    @IsNotEmpty()
    phoneNumber: string;

    @IsNotEmpty()
    gender: number;

    @IsOptional()
    hotelId: number;
}
