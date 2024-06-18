import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { AdminNotificationsController } from './admin-notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { AdminModule } from '@modules/admin/admin.module';
import { RolesModule } from '@modules/roles/roles.module';
import { WebsocketModule } from '@modules/websocket/websocket.module';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), AdminModule, RolesModule, WebsocketModule],
    controllers: [AdminNotificationsController],
    providers: [Logger, NotificationsService, NotificationsGateway],
    exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
