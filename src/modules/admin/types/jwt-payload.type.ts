/**
 * Jwt payload token data
 */
export type JwtPayloadType = {
    umail: string;
    uid: number;
    urole: string;
    ubranch: number;
    ubranch_code: string;
    iat: number;
    exp: number;
};
