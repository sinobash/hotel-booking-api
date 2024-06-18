import { Module } from '@nestjs/common';
import { AdminModule } from '@modules/admin/admin.module';
import { WebsocketService } from './websocket.service';

@Module({
    imports: [AdminModule],
    providers: [WebsocketService],
    exports: [WebsocketService],
})
export class WebsocketModule {}
