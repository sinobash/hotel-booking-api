import { IsOptional } from 'class-validator';

export class SearchFacilityDto {
    @IsOptional()
    name: string;

    @IsOptional()
    icon: string;
}
