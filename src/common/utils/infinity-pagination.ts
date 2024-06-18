import { InfinityPaginationResultType } from '@common/types/infinity-pagination-result.type';
import { IPaginationOptions } from '@common/types/pagination-options';

export const infinityPagination = <T>(data: T[], options: IPaginationOptions): InfinityPaginationResultType<T> => {
    return {
        data,
        hasNextPage: data.length === options.limit,
    };
};
