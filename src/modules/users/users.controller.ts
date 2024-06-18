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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CRUD_MESSAGES, UPLOAD_GROUP } from '@common/constants/app.constants';
import { ResponseResultType } from '@common/types/response-result.type';
import { User } from './entities/user.entity';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { ConfirmEmailDto } from './dto/confirm-user.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { CurrentUser } from '@common/decorators/user.decorator';
import { ActivationEnum } from '@common/enums/status.enum';
import { validateAdminAccess } from '@common/utils/app.helper';
import { CreateAccountDto } from './dto/create-account.dto';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';
import AppError from '@common/errors/app.error';

/**
 * Admin side user controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK)
@Controller({
    // path: 'users', // already set on the router module
})
export class UsersController {
    /**
     * @ignore
     */
    constructor(private readonly usersService: UsersService) {}

    @HasPermissions(Permission.CreateUser)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: CreateUserDto,
    ): Promise<ResponseResultType<User>> {
        payload.hotelId = currentUser.ubranch;
        if (validateAdminAccess(currentUser, payload.hotelId)) {
            const result = await this.usersService.create(payload);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.CreateUser)
    @Post('/account')
    @HttpCode(HttpStatus.CREATED)
    async createAccount(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: CreateAccountDto,
    ): Promise<ResponseResultType<User>> {
        payload.hotelId = currentUser.ubranch;
        if (validateAdminAccess(currentUser, payload.hotelId)) {
            const result = await this.usersService.createAccount(payload);
            const message = CRUD_MESSAGES.DATA_CREATED;
            return { message: message, data: result };
        }
    }

    @HasPermissions(Permission.ReadUser)
    @Get()
    @HttpCode(HttpStatus.OK)
    async all(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
        return await this.usersService.findAllBy(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadUser)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllFilter(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchUserDto,
    ): Promise<PageDto<User>> {
        return await this.usersService.findAllBy(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadUser)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: AdminUserData,
    ): Promise<ResponseResultType<User>> {
        // if current user role is not admin and want to retrieve user with admin's id then throw 401
        // still need improvement
        if (currentUser.urole !== RoleEnum.ADMIN && id === 1) {
            throw new AppError(
                HttpStatus.UNAUTHORIZED,
                `The user is missing permissions to complete an operation`,
                AppError.errors.INVALID_PERMISSIONS,
            );
        }
        const result = await this.usersService.findDetailById(id);
        const message = `user with value ${result.fullName} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateUser)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateUserDto,
        @CurrentUser() currentUser: AdminUserData,
    ): Promise<ResponseResultType<User>> {
        // if current user role is not admin and want to retrieve user with admin's id then throw 401
        // still need improvement
        if (currentUser.urole !== RoleEnum.ADMIN && id === 1) {
            throw new AppError(
                HttpStatus.UNAUTHORIZED,
                `The user is missing permissions to complete an operation`,
                AppError.errors.INVALID_PERMISSIONS,
            );
        }
        const result = await this.usersService.update(id, payload);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteUser)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.usersService.softDelete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }

    @HasPermissions(Permission.UpdateUser)
    @Post('email/confirm')
    @HttpCode(HttpStatus.NO_CONTENT)
    async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto): Promise<void> {
        return this.usersService.confirmEmail(confirmEmailDto.hash);
    }

    @HasPermissions(Permission.UpdateUser)
    @Patch('/status/:id')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: { status: keyof typeof ActivationEnum },
    ): Promise<any> {
        await this.usersService.updateStatus(id, dto.status);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message };
    }

    @HasPermissions(Permission.AssignUser)
    @Post('/assign-to-hotel')
    @HttpCode(HttpStatus.OK)
    async assignToHotel(@Body() payload: { userId: number; hotelId: number }): Promise<any> {
        await this.usersService.assignToHotel(payload.userId, payload.hotelId);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message };
    }

    @HasPermissions(Permission.AssignUser)
    @Post('/assign-role')
    @HttpCode(HttpStatus.OK)
    async assignRole(
        @CurrentUser() currentUser: AdminUserData,
        @Body() payload: { username: string; hotelId: number; roleAlias: string },
    ): Promise<any> {
        payload.hotelId = currentUser.ubranch;
        if (validateAdminAccess(currentUser, payload.hotelId)) {
            await this.usersService.assignRole(payload.username, payload.hotelId, payload.roleAlias);
            const message = CRUD_MESSAGES.DATA_UPDATED;
            return { message: message };
        }
    }

    @HasPermissions(Permission.UpdateUser)
    @Post('/upload-avatar/:id')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async addAvatar(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        )
        file: ImageFileDTO,
        @Param('id') id: number,
    ): Promise<any> {
        const result = await this.usersService.addAvatar(UPLOAD_GROUP.AVATARS, file, id);
        const message = `Add avatar successful`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteUser)
    @Delete('/remove-avatar/:id')
    @HttpCode(HttpStatus.OK)
    async removeAvatar(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.usersService.deleteAvatar(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
