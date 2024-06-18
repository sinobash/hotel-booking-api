import { upperCaseTransformer } from '@common/transformers/upper-case.transformer';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class SearchCountryDto {
    @MinLength(2)
    @Transform(upperCaseTransformer)
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    name: string;
}
