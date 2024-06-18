import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
    Patch,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto, DetailBannerResDto } from './dto/create-banner.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { SearchOneBannerDto } from './dto/search-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side banner controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/banners',
})
export class AdminBannersController {
    /**
     * @ignore
     */
    constructor(private readonly bannersService: BannersService) {}

    @HasPermissions(Permission.CreateBanner)
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
        @Body() dto: CreateBannerDto,
    ): Promise<ResponseResultType<DetailBannerResDto>> {
        const result = await this.bannersService.create(dto, file);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadBanner)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<DetailBannerResDto[]>> {
        const result = await this.bannersService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadBanner)
    @Get(':bannerId')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param() params: SearchOneBannerDto): Promise<ResponseResultType<DetailBannerResDto>> {
        const result = await this.bannersService.findDetailById(params.bannerId);
        const message = `banner with value ${result.bannerTitle} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateBanner)
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
        @Body() dto: UpdateBannerDto,
    ): Promise<ResponseResultType<DetailBannerResDto>> {
        const result = await this.bannersService.update(id, dto, file);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteBanner)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.bannersService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
