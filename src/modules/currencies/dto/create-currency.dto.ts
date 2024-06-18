import { upperCaseTransformer } from '@common/transformers/upper-case.transformer';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateCurrencyDto {
    @MinLength(2)
    @Transform(upperCaseTransformer)
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    symbol: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    decimalPlace: number;

    @IsNotEmpty()
    isDefault: number;
}
