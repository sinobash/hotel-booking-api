import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, DetailCategoryResDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side hotel category controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/categories',
})
export class AdminCategoriesController {
    /**
     * @ignore
     */
    constructor(private readonly categoriesService: CategoriesService) {}

    @HasPermissions(Permission.CreateCategory)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async create(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        )
        file: ImageFileDTO,
        @Body() dto: CreateCategoryDto,
    ): Promise<ResponseResultType<DetailCategoryResDto>> {
        const result = await this.categoriesService.create(dto, file);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadCategory)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<DetailCategoryResDto[]>> {
        const result = await this.categoriesService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadCategory)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<DetailCategoryResDto>> {
        const result = await this.categoriesService.findDetailById(id);
        const message = `category with value ${result.categoryName} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateCategory)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
                fileIsRequired: false,
            }),
        )
        file: ImageFileDTO,
        @Body() dto: UpdateCategoryDto,
    ): Promise<ResponseResultType<DetailCategoryResDto>> {
        const result = await this.categoriesService.update(id, dto, file);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteCategory)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.categoriesService.softDelete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
