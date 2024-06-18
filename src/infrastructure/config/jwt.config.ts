import { registerAs } from '@nestjs/config';
import { JwtConfig } from './config.type';

export default registerAs<JwtConfig>('jwt', () => {
    return {
        secret: process.env.JWT_SECRET ?? 'this1s$ecretz',
        expires: process.env.JWT_TOKEN_EXPIRES_IN || '1d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'this1sreFresh$ecretz',
        refreshExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '14d',
        qrSecret: process.env.JWT_QR_SECRET || 'this1sQr$ecretz',
        qrExpires: process.env.JWT_QR_TOKEN_EXPIRES_IN || '1h',
        qrBlacklistExpires: process.env.JWT_QR_TOKEN_BLACKLIST_EXPIRES_IN || '1m',
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
    };
});
