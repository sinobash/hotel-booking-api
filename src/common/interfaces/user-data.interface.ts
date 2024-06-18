/**
 * Jwt payload token data for guest
 */
export interface UserData {
    sub: string;
    key: number;
    iat: number;
    exp: number;
}
