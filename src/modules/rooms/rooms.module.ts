import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomFeatures } from './entities/room-features.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { RoomTypesModule } from '@modules/roomtypes/roomtypes.module';
import { FeaturesModule } from '@modules/features/features.module';
import { AdminRoomsController } from './admin-rooms.controller';
import { RolesModule } from '@modules/roles/roles.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Room, RoomFeatures]),
        RolesModule,
        HotelsModule,
        RoomTypesModule,
        FeaturesModule,
        NotificationsModule,
    ],
    controllers: [AdminRoomsController, RoomsController],
    providers: [Logger, RoomsService],
    exports: [RoomsService],
})
export class RoomsModule {}
