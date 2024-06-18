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
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto, UpdateRoomStatusDto } from './dto/update-room.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { ResponseResultType } from '@common/types/response-result.type';
import { Room } from './entities/room.entity';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchOneRoomDto, SearchRoomDto } from './dto/search-room.dto';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { validateAdminAccess } from '@common/utils/app.helper';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side room controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/rooms',
})
export class AdminRoomsController {
    /**
     * @ignore
     */
    constructor(private readonly roomsService: RoomsService) {}

    @HasPermissions(Permission.CreateRoom)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() currentUser: AdminUserData,
        @Body() dto: CreateRoomDto,
    ): Promise<ResponseResultType<Room>> {
        const roomType = await this.roomsService.findHotelByRoomTypeId(dto.roomTypeId);
        const hotelId = roomType.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            const result = await this.roomsService.create(dto, currentUser.ubranch);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadRoom)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllBy(
        @CurrentUser() currentUser: AdminUserData,
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchRoomDto,
    ): Promise<PageDto<Room>> {
        searchDto.hotelId = currentUser.ubranch;
        if (validateAdminAccess(currentUser, searchDto.hotelId)) {
            return await this.roomsService.findAllBy(pageOptionsDto, searchDto);
        }
    }

    @HasPermissions(Permission.ReadRoom)
    @Get(':roomId')
    @HttpCode(HttpStatus.OK)
    async findOneById(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomDto,
    ): Promise<ResponseResultType<Room>> {
        params.roomId = Number(params.roomId);
        const room = await this.roomsService.findHotelById(params.roomId);
        params.hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomsService.findById(params.roomId);
            const message = `room with value ${result.code} has been found`;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.UpdateRoom)
    @Patch(':roomId')
    @HttpCode(HttpStatus.OK)
    async update(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomDto,
        @Body() updateRoomDto: UpdateRoomDto,
    ): Promise<ResponseResultType<Room>> {
        params.roomId = Number(params.roomId);
        const room = await this.roomsService.findHotelById(params.roomId);
        params.hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomsService.update(params.roomId, updateRoomDto);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.UpdateRoom)
    @Patch('/status/:id')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomDto,
        @Body() payload: { isAvailable: number },
    ): Promise<ResponseResultType<Room>> {
        params.roomId = Number(params.roomId);
        const room = await this.roomsService.findHotelById(params.roomId);
        params.hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomsService.updateStatus(params.roomId, payload.isAvailable);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.UpdateRoom)
    @Patch(':roomId/housekeeping-status')
    @HttpCode(HttpStatus.OK)
    async updateHouseKeepingStatus(
        @CurrentUser() currentUser: AdminUserData,
        @Param() params: SearchOneRoomDto,
        @Body() payload: UpdateRoomStatusDto,
    ): Promise<ResponseResultType<Room>> {
        params.roomId = Number(params.roomId);
        const room = await this.roomsService.findHotelById(params.roomId);
        params.hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const result = await this.roomsService.updateHouseKeepingStatus(
                params.roomId,
                payload.houseKeepingStatus,
                currentUser,
            );
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.DeleteRoom)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@CurrentUser() currentUser: AdminUserData, @Param() params: SearchOneRoomDto): Promise<any> {
        params.roomId = Number(params.roomId);
        const room = await this.roomsService.findHotelById(params.roomId);
        params.hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, params.hotelId)) {
            const isDeleted = await this.roomsService.delete(params.roomId);
            const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateRoom)
    @Post('/add-features')
    @HttpCode(HttpStatus.OK)
    async addFeatures(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { roomId: number; featureIds: number[] },
    ): Promise<any> {
        const room = await this.roomsService.findHotelById(payload.roomId);
        const hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            await this.roomsService.addFeatures(payload.roomId, payload.featureIds);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateRoom)
    @Post('/update-features')
    @HttpCode(HttpStatus.OK)
    async updateFeatures(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { roomId: number; facilityIds: number[] },
    ): Promise<any> {
        const room = await this.roomsService.findHotelById(payload.roomId);
        const hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            await this.roomsService.updateFeatures(payload.roomId, payload.facilityIds);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateRoom)
    @Post('/delete-features')
    @HttpCode(HttpStatus.OK)
    async deleteFeatures(@CurrentUser() currentUser: AdminUserData, @Body() payload: { roomId: number }): Promise<any> {
        const room = await this.roomsService.findHotelById(payload.roomId);
        const hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            await this.roomsService.deleteFeatures(payload.roomId);
            const message = CRUD_MESSAGES.DATA_DELETED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.ReadRoom)
    @Get('/features/room/:id')
    @HttpCode(HttpStatus.OK)
    async findFeaturesByRoomId(
        @CurrentUser() currentUser: AdminUserData,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<any> {
        const room = await this.roomsService.findHotelById(id);
        const hotelId = room.hotel.id;
        if (validateAdminAccess(currentUser, hotelId)) {
            const result = await this.roomsService.findFeaturesByRoomId(id);
            const message = CRUD_MESSAGES.DATA_RETRIEVED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadRoom)
    @Get('/features/:id')
    @HttpCode(HttpStatus.OK)
    async findFeaturesById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomsService.findFeatureById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }
}
