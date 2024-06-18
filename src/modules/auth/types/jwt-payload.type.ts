/**
 * Jwt payload token data
 */
export type JwtPayloadType = {
    sub: string;
    key: number;
    iat: number;
    exp: number;
};
