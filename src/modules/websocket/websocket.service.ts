import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '@modules/admin/auth.service';
import { Socket } from 'socket.io';
import { JwtPayloadType } from '@modules/admin/types/jwt-payload.type';
import { WsException } from '@nestjs/websockets';
import { AUTH_MESSAGES } from '@common/constants/app.constants';

@Injectable()
export class WebsocketService {
    private readonly logger = new Logger(WebsocketService.name);

    constructor(private readonly adminAuthService: AuthService) {}

    verifyJwtAndGetPayload(client: Socket): JwtPayloadType {
        let user: JwtPayloadType;
        try {
            const bearerToken: string = client.handshake.headers.authorization?.split(' ')[1];
            user = this.adminAuthService.verifyUser(bearerToken);
        } catch (error) {
            this.logger.error(error);
            throw new WsException({
                message: AUTH_MESSAGES.SESSION_EXPIRED,
            });
        }
        return user;
    }

    async joinRoom(client: Socket, room: string): Promise<void> {
        await client.join(room);
    }

    async leaveRoom(client: Socket, room: string): Promise<void> {
        await client.leave(room);
    }
}
