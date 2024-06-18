import { Sort } from '@common/constants/sort.constant';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageOptionsDto {
    @IsEnum(Sort)
    @IsOptional()
    readonly order?: Sort = Sort.DESC;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    readonly page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    readonly take?: number = 10;

    get skip(): number {
        return this.page <= 0 ? 0 : (this.page - 1) * this.take;
    }
}
