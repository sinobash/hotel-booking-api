import { Logger, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaFile } from './entities/media-file.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MediaFile])],
    controllers: [FilesController],
    providers: [Logger, FilesService],
    exports: [FilesService],
})
export class FilesModule {}
