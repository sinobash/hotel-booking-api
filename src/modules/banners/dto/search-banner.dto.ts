import { IsNotEmpty, IsNumberString } from 'class-validator';

export class SearchOneBannerDto {
    @IsNotEmpty()
    @IsNumberString()
    bannerId: number;
}
