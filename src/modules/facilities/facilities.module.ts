import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilitiesService } from './facilities.service';
import { AdminFacilitiesController } from './admin-facilities.controller';
import { FacilitiesController } from './facilities.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Facility]), RolesModule],
    controllers: [AdminFacilitiesController, FacilitiesController],
    providers: [Logger, FacilitiesService],
    exports: [FacilitiesService],
})
export class FacilitiesModule {}
