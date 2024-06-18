import { registerAs } from '@nestjs/config';
import { LogConfig } from './config.type';

export default registerAs<LogConfig>('log', () => {
    return {
        channel: process.env.LOG_CHANNEL ?? 'slack',
        level: process.env.LOG_LEVEL ?? 'debug',
        dir: process.env.LOG_DIR ?? 'logs',
        name: process.env.LOG_NAME ?? 'app',
    };
});
