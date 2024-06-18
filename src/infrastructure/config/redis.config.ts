import { registerAs } from '@nestjs/config';
import { RedisConfig } from './config.type';

export default registerAs<RedisConfig>('redis', () => {
    return {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || null,
    };
});
