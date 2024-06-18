import { upperCaseTransformer } from '@common/transformers/upper-case.transformer';
import { IsNotExist } from '@common/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, MinLength, Validate } from 'class-validator';

export class CreateCountryDto {
    @MinLength(2)
    @Transform(upperCaseTransformer)
    @IsNotEmpty()
    @Validate(IsNotExist, ['Country', 'code'], {
        message: 'country code is already exist', // if already exist then throw error
    })
    code: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    phoneCode: string;

    @IsOptional()
    latitude: string;

    @IsOptional()
    longitude: string;

    @IsNotEmpty()
    currencyId: number;
}
