/**
 * Jwt payload QR token data
 */
export interface QrData {
    key: number;
    code: string;
    start: Date;
    end: Date;
    iat: number;
    exp: number;
}

export interface QrEncode {
    data: string;
}
