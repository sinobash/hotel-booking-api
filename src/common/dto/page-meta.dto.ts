import { PageMetaDtoParameters } from '@common/interfaces/page-meta-dto-parameters.interface';

export class PageMetaDto {
    readonly total: number;
    readonly page: number;
    readonly take: number;
    readonly pageCount: number;
    readonly hasPreviousPage: boolean;
    readonly hasNextPage: boolean;

    constructor({ pageOptionsDto, total }: PageMetaDtoParameters) {
        this.page = pageOptionsDto.page <= 0 ? (this.page = 1) : pageOptionsDto.page;
        this.take = pageOptionsDto.take;
        this.total = total;
        this.pageCount = Math.ceil(this.total / this.take);
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.pageCount;
    }
}
