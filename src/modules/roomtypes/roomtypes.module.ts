import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomType } from './entities/roomtype.entity';
import { RoomTypeFeatures } from './entities/roomtype-features.entity';
import { RoomTypeMedia } from './entities/roomtype-medias.entity';
import { RoomTypesService } from './roomtypes.service';
import { RoomtypesController } from './roomtypes.controller';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { FeaturesModule } from '@modules/features/features.module';
import { FilesModule } from '@modules/files/files.module';
import { AdminRoomTypesController } from './admin-roomtypes.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoomType, RoomTypeFeatures, RoomTypeMedia]),
        RolesModule,
        forwardRef(() => HotelsModule),
        FeaturesModule,
        FilesModule,
    ],
    controllers: [AdminRoomTypesController, RoomtypesController],
    providers: [Logger, RoomTypesService],
    exports: [RoomTypesService],
})
export class RoomTypesModule {}
