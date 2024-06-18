import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '@modules/files/files.module';
import { Guest } from './entities/guest.entity';
import { GuestDocument } from './entities/guest-documents.entity';
import { GuestsService } from './guests.service';
import { AdminGuestsController } from './admin-guests.controller';
import { GuestsController } from './guests.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Guest, GuestDocument]), FilesModule, RolesModule],
    controllers: [AdminGuestsController, GuestsController],
    providers: [Logger, GuestsService],
    exports: [GuestsService],
})
export class GuestsModule {}
