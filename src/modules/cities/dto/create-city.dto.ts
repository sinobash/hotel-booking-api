import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCityDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    latitude: string;

    @IsOptional()
    longitude: string;

    @IsNotEmpty()
    countryId: number;
}
