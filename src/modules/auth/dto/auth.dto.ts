import { lowerCaseTransformer } from '@common/transformers/lower-case.transformer';
import { IsExist } from '@common/validators/is-exists.validator';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsPhoneNumber, Matches, MaxLength, MinLength, Validate } from 'class-validator';

export class AuthEmailLoginDto {
    @IsEmail()
    @Transform(lowerCaseTransformer)
    @Validate(IsExist, ['Guest', 'email'], {
        message: 'Please make sure that your data is correct',
    })
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    password: string;
}

export class AuthMobileNumberLoginDto {
    @IsNotEmpty()
    @MaxLength(64)
    @IsPhoneNumber()
    mobileNumber: string; // country phone code is mandatory included in mobile number

    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'password too weak' })
    password: string;
}
