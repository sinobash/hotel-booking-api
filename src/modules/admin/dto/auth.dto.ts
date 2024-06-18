import { lowerCaseTransformer } from '@common/transformers/lower-case.transformer';
import { IsExist } from '@common/validators/is-exists.validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty, Validate } from 'class-validator';

export class AuthEmailLoginDto {
    @Transform(lowerCaseTransformer)
    @Validate(IsExist, ['User'], {
        message: 'The email is invalid',
    })
    email: string;

    @IsNotEmpty()
    password: string;
}

export class AuthConfirmEmailDto {
    @IsNotEmpty()
    hash: string;
}
