import { IsOptional } from 'class-validator';

export class ImageFileDTO {
    @IsOptional()
    fieldname: string;

    @IsOptional()
    originalname: string;

    @IsOptional()
    encoding: string;

    @IsOptional()
    mimetype: string;

    @IsOptional()
    buffer: any;

    @IsOptional()
    size: number;
}

export class ImageResponseDTO {
    @IsOptional()
    ETag?: string;

    @IsOptional()
    Location?: string;

    @IsOptional()
    key?: string;

    @IsOptional()
    Key?: string;

    @IsOptional()
    Bucket?: string;
}
