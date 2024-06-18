import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';
import { AdminFeaturesController } from './admin-features.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Feature]), RolesModule],
    controllers: [AdminFeaturesController, FeaturesController],
    providers: [Logger, FeaturesService],
    exports: [FeaturesService],
})
export class FeaturesModule {}
