/**
 * Jwt payload token data for admin
 */
export interface AdminUserData {
    umail: string;
    uid: number;
    urole: string;
    ubranch: number;
    ubranch_code: string;
    iat: number;
    exp: number;
}
