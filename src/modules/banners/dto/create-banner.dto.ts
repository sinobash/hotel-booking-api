import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBannerDto {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    bannerDesc: string;

    @IsOptional()
    bannerLink: string;

    @IsNotEmpty()
    bannerType: string;
}

export class DetailBannerResDto {
    bannerId: number;
    bannerTitle: string;
    bannerDesc?: string;
    bannerImageUrl: string;
    bannerLink?: string;
    bannerType: string;
}
