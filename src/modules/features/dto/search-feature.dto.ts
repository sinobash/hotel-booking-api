import { IsOptional } from 'class-validator';

export class SearchFeatureDto {
    @IsOptional()
    name: string;

    @IsOptional()
    icon: string;
}
