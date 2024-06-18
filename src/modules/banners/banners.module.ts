import { Logger, Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { FilesModule } from '@modules/files/files.module';
import { BannersController } from './banners.controller';
import { AdminBannersController } from './admin-banners.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Banner]), RolesModule, FilesModule],
    controllers: [BannersController, AdminBannersController],
    providers: [Logger, BannersService],
    exports: [BannersService],
})
export class BannersModule {}
