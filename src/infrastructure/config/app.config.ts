import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';

export default registerAs<AppConfig>('app', () => {
    return {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        name: process.env.APP_NAME ?? 'App',
        rootKey: process.env.ROOT_KEY,
        workingDirectory: process.env.PWD || process.cwd(),
        clientHost: process.env.APP_CLIENT_HOST ?? '',
        serverHost: process.env.APP_SERVER_HOST ?? 'localhost:'.concat(process.env.PORT),
        port: parseInt(process.env.APP_PORT, 10) || 3000,
        apiPrefix: process.env.API_PREFIX ?? 'hotel-api',
        version: process.env.APP_VERSION ?? 'v1',
    };
});
