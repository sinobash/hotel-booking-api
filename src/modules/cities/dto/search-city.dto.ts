import { IsNotEmpty } from 'class-validator';

export class SearchCityDto {
    @IsNotEmpty()
    name: string;
}
