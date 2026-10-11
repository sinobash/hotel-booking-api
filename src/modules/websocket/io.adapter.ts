import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext,
        private readonly configService: ConfigService,
    ) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const assignPort = port || this.configService.get<number>('socketio.serverPort');
        const path = this.configService.get<string>('socketio.serverPath');
        const origins = this.configService.get<string>('socketio.serverCorsOrigin');
        const origin = origins?.split(',');
        const credentials = !origin.includes('*');
        options.path = path;
        options.cors = { origin, credentials };
        options.allowEIO3 = true;
        const server = super.createIOServer(assignPort, options) as Server;
        return server;
    }
}
