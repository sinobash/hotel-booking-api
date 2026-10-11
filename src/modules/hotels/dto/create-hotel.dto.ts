import { upperCaseTransformer } from '@common/transformers/upper-case.transformer';
import { IsNotExist } from '@common/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, MinLength, Validate } from 'class-validator';

export class CreateHotelDto {
    @MinLength(2)
    @Transform(upperCaseTransformer)
    @IsNotEmpty()
    @Validate(IsNotExist, ['Hotel', 'code'], {
        message: 'hotel code is already exist', // if already exist then throw error
    })
    code: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    description: string;

    @IsNotEmpty()
    address: string;

    @IsOptional()
    latitude: string;

    @IsOptional()
    longitude: string;

    @IsOptional()
    geoHash: string;

    @IsNotEmpty()
    categoryId: number;

    @IsNotEmpty()
    cityId: number;

    @IsOptional()
    facilityIds: number[];
}
