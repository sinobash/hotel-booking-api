import { MaybeType } from '@common/types/maybe.type';
import { TransformFnParams } from 'class-transformer';

export const upperCaseTransformer = (params: TransformFnParams): MaybeType<string> =>
    params.value?.toUpperCase().trim();
