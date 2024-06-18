import { registerAs } from '@nestjs/config';
import { SocketIoConfig } from './config.type';

export default registerAs<SocketIoConfig>('socketio', () => {
    return {
        serverPort: parseInt(process.env.SOCKETIO_SERVER_PORT, 10) || 4001,
        serverPath: process.env.SOCKETIO_SERVER_PATH ?? '',
        serverCorsOrigin: process.env.SOCKETIO_SERVER_CORS_ORIGIN ?? '*',
    };
});
