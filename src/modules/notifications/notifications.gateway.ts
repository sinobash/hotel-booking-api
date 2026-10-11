import { ConfigService } from '@nestjs/config';
import {
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    WebSocketServer,
    ConnectedSocket,
    WsResponse,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { WebsocketService } from '@modules/websocket/websocket.service';
import { JwtPayloadType } from '@modules/admin/types/jwt-payload.type';
import { WsEventNames } from '@modules/websocket/socket.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway({
    transport: ['websocket', 'polling'],
    cors: {
        methods: ['GET', 'POST'],
    },
    namespace: '/admin/notifications',
    // pingTimeout: 2000,
    // pingInterval: 5000,
    // reconnection: true,
    // reconnectionDelay: 1000,
    // reconnectionDelayMax: 5000,
    // reconnectionAttempts: 3,
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger: Logger = new Logger(NotificationsGateway.name);

    @WebSocketServer()
    server: SocketIOServer;

    private rooms: Array<string> = [];
    private clients: Socket[] = [];
    private roomParticipants: Map<string, Socket[]> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly websocketService: WebsocketService,
    ) {}

    afterInit(server: SocketIOServer) {
        this.logger.log('Notification Gateway Initialized');
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        const user: JwtPayloadType = this.websocketService.verifyJwtAndGetPayload(client);
        this.logger.log(`⚡: user ${user.umail} just connected!`);
        const room = `notification:${user.ubranch_code}`;
        this.clients.push(client);
        await this.websocketService.joinRoom(client, room);
        this.rooms.push(room);
        this.roomParticipants.set(room, this.clients);
        this.logger.debug(`rooms ${Array.from(client.rooms.entries())}`);
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        const user: JwtPayloadType = this.websocketService.verifyJwtAndGetPayload(client);
        this.logger.log(`⚡: user ${user.umail} just disconnected!`);
        const room = `notification:${user.ubranch_code}`;
        const iRemove = this.clients.indexOf(client);
        this.clients.splice(iRemove, 1);
        this.roomParticipants.set(room, this.clients);
    }

    @OnEvent('booking.created')
    async handleBookingCreated(
        @ConnectedSocket() client: Socket,
        data: CreateNotificationDto,
    ): Promise<WsResponse<unknown>> {
        const event: string = WsEventNames.NewNotification;
        this.logger.debug(`New booking: ${JSON.stringify(data)}`);
        const room = `notification:HQ`;
        const room_target = `notification:${data.receiverKey}`;
        // const client = this.roomParticipants.get(room);
        client.to(room_target).emit(WsEventNames.NewNotification, data); // broadcast to all connected clients in the {room_target} room, except this socket
        return { event, data };
    }

    @OnEvent('room.housekeeping.updated')
    async handleRoomHousekeepingStatusUpdated(
        @ConnectedSocket() client: Socket,
        data: CreateNotificationDto,
    ): Promise<WsResponse<unknown>> {
        const event: string = WsEventNames.NewNotification;
        this.logger.debug(`Housekeeping status updated: ${JSON.stringify(data)}`);
        const room = `notification:HQ`;
        const room_target = `notification:${data.receiverKey}`;
        // const client = this.roomParticipants.get(room);
        client.to(room_target).emit(WsEventNames.NewNotification, data); // broadcast to all connected clients in the {room_target} room, except this socket
        return { event, data };
    }
}
