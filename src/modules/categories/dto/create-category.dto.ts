import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    description: string;
}

export class DetailCategoryResDto {
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    categoryDesc?: string;
    categoryUrl: string;
    categoryActive: number;
}
