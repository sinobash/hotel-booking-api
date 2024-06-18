import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesModule } from '@modules/roles/roles.module';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { FilesModule } from '@modules/files/files.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), RolesModule, HotelsModule, FilesModule],
    controllers: [UsersController],
    providers: [Logger, UsersService],
    exports: [UsersService],
})
export class UsersModule {}
