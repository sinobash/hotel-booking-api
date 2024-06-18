import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './config.type';

export default registerAs<DatabaseConfig>('database', () => {
    return {
        url: process.env.DATABASE_URL,
        type: process.env.DB_TYPE ?? 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME ?? 'postgres',
        username: process.env.DB_USERNAME ?? 'postgres',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 100,
        sslEnabled: process.env.DB_SSL_ENABLED === 'true',
        rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true',
        ca: process.env.DB_CA,
        key: process.env.DB_KEY,
        cert: process.env.DB_CERT,
    };
});
