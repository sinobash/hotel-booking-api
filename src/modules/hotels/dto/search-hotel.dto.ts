import { HotelCategoryType } from '@common/enums/category.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class SearchHotelDto {
    @IsOptional()
    hotelId: number;

    @IsOptional()
    code: string;

    @IsOptional()
    name: string;

    @IsOptional()
    address: string;

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsOptional()
    @IsEnum(HotelCategoryType)
    category?: HotelCategoryType;

    @IsOptional()
    cityId: number;
}

export class SearchOneHotelDto {
    @IsNotEmpty()
    @IsNumberString()
    hotelId: number;
}
