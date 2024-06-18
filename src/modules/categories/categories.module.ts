import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { FilesModule } from '@modules/files/files.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Category]), RolesModule, FilesModule],
    controllers: [CategoriesController, AdminCategoriesController],
    providers: [Logger, CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}
