import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    Query,
    Param,
    ParseIntPipe,
    Patch,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { RoomTypesService } from './roomtypes.service';
import { CreateRoomTypeDto } from './dto/create-roomtype.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { ResponseResultType } from '@common/types/response-result.type';
import { RoomType } from './entities/roomtype.entity';
import { CRUD_MESSAGES, UPLOAD_GROUP } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchOneRoomTypeDto, SearchRoomTypeDto } from './dto/search-roomtype.dto';
import { UpdateRoomTypeDto } from './dto/update-roomtype.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { validateAdminAccess } from '@common/utils/app.helper';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side room type controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/room-types',
})
export class AdminRoomTypesController {
    /**
     * @ignore
     */
    constructor(private readonly roomTypesService: RoomTypesService) {}

    @HasPermissions(Permission.CreateRoomType)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() currentUser: AdminUserData,
        @Body() dto: CreateRoomTypeDto,
    ): Promise<ResponseResultType<RoomType>> {
        if (validateAdminAccess(currentUser, dto.hotelId)) {
            const result = await this.roomTypesService.create(dto);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message, data: result };
        }
    }

    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllBy(
        @CurrentUser() currentUser: AdminUserData,
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchRoomTypeDto,
    ): Promise<PageDto<RoomType>> {
        searchDto.hotelId = currentUser.ubranch;
        if (validateAdminAccess(currentUser, searchDto.hotelId)) {
            return await this.roomTypesService.findAllBy(pageOptionsDto, searchDto);
        }
    }

    @HasPermissions(Permission.ReadRoomType)
    @Get(':roomTypeId')
    @HttpCode(HttpStatus.OK)
    async findOneById(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomTypeDto,
    ): Promise<ResponseResultType<RoomType>> {
        params.roomTypeId = Number(params.roomTypeId);
        const roomType = await this.roomTypesService.findHotelById(params.roomTypeId);
        params.hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomTypesService.findById(params.roomTypeId);
            const message = `room type with value ${result.name} has been found`;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.UpdateRoomType)
    @Patch(':roomTypeId')
    @HttpCode(HttpStatus.OK)
    async update(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomTypeDto,
        @Body() updateRoomTypeDto: UpdateRoomTypeDto,
    ): Promise<ResponseResultType<RoomType>> {
        params.roomTypeId = Number(params.roomTypeId);
        const roomType = await this.roomTypesService.findHotelById(params.roomTypeId);
        params.hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomTypesService.update(params.roomTypeId, updateRoomTypeDto);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.DeleteRoomType)
    @Delete(':roomTypeId')
    @HttpCode(HttpStatus.OK)
    async remove(@CurrentUser() currentUser: AdminUserData, @Param() params: SearchOneRoomTypeDto): Promise<any> {
        params.roomTypeId = Number(params.roomTypeId);
        const roomType = await this.roomTypesService.findHotelById(params.roomTypeId);
        params.hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const isDeleted = await this.roomTypesService.delete(params.roomTypeId);
            const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateRoomType)
    @Post('/add-features')
    @HttpCode(HttpStatus.OK)
    async addFeatures(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { roomTypeId: number; featureIds: number[] },
    ): Promise<any> {
        const roomType = await this.roomTypesService.findHotelById(payload.roomTypeId);
        const hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            await this.roomTypesService.addFeatures(payload.roomTypeId, payload.featureIds);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateRoomType)
    @Post('/update-features')
    @HttpCode(HttpStatus.OK)
    async updateFeatures(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { roomTypeId: number; featureIds: number[] },
    ): Promise<any> {
        const roomType = await this.roomTypesService.findHotelById(payload.roomTypeId);
        const hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            await this.roomTypesService.updateFeatures(payload.roomTypeId, payload.featureIds);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.DeleteRoomType)
    @Post('/delete-features')
    @HttpCode(HttpStatus.OK)
    async deleteFeatures(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { roomTypeId: number },
    ): Promise<any> {
        const roomType = await this.roomTypesService.findHotelById(payload.roomTypeId);
        const hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            await this.roomTypesService.deleteFeatures(payload.roomTypeId);
            const message = CRUD_MESSAGES.DATA_DELETED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.ReadRoomType)
    @Get('/features/room-type/:roomTypeId')
    @HttpCode(HttpStatus.OK)
    async findFeaturesByRoomTypeId(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomTypeDto,
    ): Promise<any> {
        params.roomTypeId = Number(params.roomTypeId);
        const roomType = await this.roomTypesService.findHotelById(params.roomTypeId);
        params.hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomTypesService.findFeaturesByRoomTypeId(params.roomTypeId);
            const message = CRUD_MESSAGES.DATA_RETRIEVED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadRoomType)
    @Get('/features/:id')
    @HttpCode(HttpStatus.OK)
    async findFeaturesById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomTypesService.findFeatureById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UploadRoomType)
    @Post('/upload')
    @HttpCode(HttpStatus.CREATED)
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
        @Body() dto: SearchOneRoomTypeDto,
    ): Promise<any> {
        dto.roomTypeId = Number(dto.roomTypeId);
        const roomType = await this.roomTypesService.findHotelById(dto.roomTypeId);
        dto.hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, dto.hotelId)) {
            const result = await this.roomTypesService.uploadMedia(UPLOAD_GROUP.ROOM_TYPES, file, dto.roomTypeId);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadRoomType)
    @Get('/files/room-type/:id')
    @HttpCode(HttpStatus.OK)
    async findMediasByRoomTypeId(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomTypeDto,
    ): Promise<any> {
        params.roomTypeId = Number(params.roomTypeId);
        const roomType = await this.roomTypesService.findHotelById(params.roomTypeId);
        params.hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomTypesService.findMediasByRoomTypeId(params.roomTypeId);
            const message = CRUD_MESSAGES.DATA_RETRIEVED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadRoomType)
    @Get('/file/:id')
    @HttpCode(HttpStatus.OK)
    async findMediaById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomTypesService.findMediaById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteRoomType)
    @Delete('/file/:id')
    @HttpCode(HttpStatus.OK)
    async removeMedia(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.roomTypesService.deleteFile(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
