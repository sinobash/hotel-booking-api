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
    Query,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES, UPLOAD_GROUP } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchHotelDto, SearchOneHotelDto } from './dto/search-hotel.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { validateAdminAccess } from '@common/utils/app.helper';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side hotel controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/hotels',
})
export class AdminHotelsController {
    /**
     * @ignore
     */
    constructor(private readonly hotelsService: HotelsService) {}

    @HasPermissions(Permission.CreateHotel)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateHotelDto): Promise<ResponseResultType<Hotel>> {
        const result = await this.hotelsService.create(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadHotel)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllBy(
        @CurrentUser() currentUser: AdminUserData,
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchHotelDto,
    ): Promise<PageDto<Hotel>> {
        searchDto.hotelId = currentUser.ubranch;
        if (validateAdminAccess(currentUser, searchDto.hotelId)) {
            return await this.hotelsService.findAllBy(pageOptionsDto, searchDto);
        }
    }

    @HasPermissions(Permission.ReadHotel)
    @Get(':hotelId')
    @HttpCode(HttpStatus.OK)
    async findOneById(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneHotelDto,
    ): Promise<ResponseResultType<Hotel>> {
        params.hotelId = Number(params.hotelId);
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.hotelsService.findById(params.hotelId);
            const message = `hotel with value ${result.name} has been found`;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.UpdateHotel)
    @HasRoles(RoleEnum.ADMIN, RoleEnum.BACK)
    @Patch(':hotelId')
    @HttpCode(HttpStatus.OK)
    async update(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneHotelDto,
        @Body() updateHotelDto: UpdateHotelDto,
    ): Promise<any> {
        params.hotelId = Number(params.hotelId);
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.hotelsService.update(params.hotelId, updateHotelDto);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.UpdateHotel)
    @HasRoles(RoleEnum.ADMIN)
    @Patch('/status/:hotelId')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneHotelDto,
        @Body() payload: { isActive: number },
    ): Promise<ResponseResultType<Hotel>> {
        params.hotelId = Number(params.hotelId);
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.hotelsService.updateStatus(params.hotelId, payload.isActive);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.DeleteHotel)
    @HasRoles(RoleEnum.ADMIN)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@CurrentUser() currentUser: AdminUserData, @Param('id', ParseIntPipe) id: number): Promise<any> {
        if (validateAdminAccess(currentUser, id)) {
            const isDeleted = await this.hotelsService.delete(id);
            const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateHotel)
    @HasRoles(RoleEnum.ADMIN, RoleEnum.BACK)
    @Post('/add-facilities')
    @HttpCode(HttpStatus.OK)
    async addFacilities(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { hotelId: number; facilityIds: number[] },
    ): Promise<any> {
        if (validateAdminAccess(currentUser, payload.hotelId)) {
            await this.hotelsService.addFacilities(payload.hotelId, payload.facilityIds);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateHotel)
    @Post('/update-facilities')
    @HttpCode(HttpStatus.OK)
    async updateFacilities(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { hotelId: number; facilityIds: number[] },
    ): Promise<any> {
        if (validateAdminAccess(currentUser, payload.hotelId)) {
            await this.hotelsService.updateFacilities(payload.hotelId, payload.facilityIds);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.DeleteHotel)
    @Post('/delete-facilities')
    @HttpCode(HttpStatus.OK)
    async deleteFacilities(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { hotelId: number },
    ): Promise<any> {
        if (validateAdminAccess(currentUser, payload.hotelId)) {
            await this.hotelsService.deleteFacilities(payload.hotelId);
            const message = CRUD_MESSAGES.DATA_DELETED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.ReadHotel)
    @Get('/facilities/hotel/:hotelId')
    @HttpCode(HttpStatus.OK)
    async findFacilitiesByHotelId(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneHotelDto,
    ): Promise<any> {
        params.hotelId = Number(params.hotelId);
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.hotelsService.findFacilitiesByHotelId(params.hotelId);
            const message = CRUD_MESSAGES.DATA_RETRIEVED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadHotel)
    @Get('/facilities/:id')
    @HttpCode(HttpStatus.OK)
    async findFacilitiesById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.hotelsService.findFacilityById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UploadHotel)
    @Post('/upload/:hotelId')
    @HttpCode(HttpStatus.CREATED)
    // @UseInterceptors(ValidateParamsInterceptor)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async uploadMedia(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        )
        file: ImageFileDTO,
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneHotelDto,
    ): Promise<any> {
        params.hotelId = Number(params.hotelId);
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.hotelsService.uploadMedia(UPLOAD_GROUP.HOTELS, file, params.hotelId);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadHotel)
    @Get('/files/hotel/:hotelId')
    @HttpCode(HttpStatus.OK)
    async findMediasByHotelId(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneHotelDto,
    ): Promise<any> {
        params.hotelId = Number(params.hotelId);
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.hotelsService.findMediasByHotelId(params.hotelId);
            const message = CRUD_MESSAGES.DATA_RETRIEVED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadHotel)
    @Get('/file/:id')
    @HttpCode(HttpStatus.OK)
    async findMediaById(
        @CurrentUser() currentUser: AdminUserData,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<any> {
        const result = await this.hotelsService.findMediaById(id, currentUser.ubranch);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UploadHotel)
    @HasRoles(RoleEnum.ADMIN, RoleEnum.BACK)
    @Delete('/file/:id')
    @HttpCode(HttpStatus.OK)
    async removeMedia(@CurrentUser() currentUser: AdminUserData, @Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.hotelsService.deleteFile(id, currentUser.ubranch);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
