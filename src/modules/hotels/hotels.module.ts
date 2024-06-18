import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { HotelFacilities } from './entities/hotel-facilities.entity';
import { HotelMedia } from './entities/hotel-medias.entity';
import { HotelsService } from './hotels.service';
import { AdminHotelsController } from './admin-hotels.controller';
import { HotelsController } from './hotels.controller';
import { CitiesModule } from '@modules/cities/cities.module';
import { FacilitiesModule } from '@modules/facilities/facilities.module';
import { FilesModule } from '@modules/files/files.module';
import { RoomTypesModule } from '@modules/roomtypes/roomtypes.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Hotel, HotelFacilities, HotelMedia]),
        RolesModule,
        CitiesModule,
        FacilitiesModule,
        FilesModule,
        CategoriesModule,
        forwardRef(() => RoomTypesModule),
    ],
    controllers: [AdminHotelsController, HotelsController],
    providers: [Logger, HotelsService],
    exports: [HotelsService],
})
export class HotelsModule {}
