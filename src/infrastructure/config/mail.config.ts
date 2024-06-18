import { registerAs } from '@nestjs/config';
import { MailConfig } from './config.type';

export default registerAs<MailConfig>('mail', () => {
    return {
        port: parseInt(process.env.MAIL_PORT) || 1025,
        host: process.env.MAIL_HOST ?? '127.0.0.1',
        user: process.env.MAIL_AUTH_USER,
        password: process.env.MAIL_AUTH_PASS,
        defaultEmail: process.env.MAIL_DEFAULT_EMAIL ?? 'noreply@example.com',
        defaultName: process.env.MAIL_DEFAULT_NAME ?? 'System Support',
        ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
        secure: process.env.MAIL_SECURE === 'true',
        requireTLS: process.env.MAIL_REQUIRE_TLS === 'true',
    };
});
