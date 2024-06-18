export type ResponseResultType<T> = Readonly<{
    message?: string;
    data: T;
}>;
