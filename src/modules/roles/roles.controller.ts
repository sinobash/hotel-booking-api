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
    Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleCapabilitiesDto, CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { Role } from './entities/role.entity';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from './enums/roles.enum';
import { RolePermissionsResDto } from './dto/role-permissions.dto';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from './enums/permission.type';

/**
 * Admin side role controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK)
@Controller({
    // path: 'roles', // already set on the router module
})
export class RolesController {
    /**
     * @ignore
     */
    constructor(private readonly rolesService: RolesService) {}

    @HasPermissions(Permission.CreateRole)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateRoleDto): Promise<ResponseResultType<Role>> {
        const result = await this.rolesService.create(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadRole)
    @Get('/permissions')
    @HttpCode(HttpStatus.OK)
    async findPermissions(): Promise<ResponseResultType<RolePermissionsResDto>> {
        const result = await this.rolesService.findPermissions();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadRole)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<Role[]>> {
        const result = await this.rolesService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadRole)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Role>> {
        const result = await this.rolesService.findById(id);
        const message = `role with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadRole)
    @Get('/filter/q')
    @HttpCode(HttpStatus.OK)
    async findOneByAlias(@Query() query: { alias: string }): Promise<ResponseResultType<Role>> {
        const result = await this.rolesService.findOne({ alias: query.alias });
        const message = `role with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateRole)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto): Promise<ResponseResultType<Role>> {
        const result = await this.rolesService.update(id, dto);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteRole)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.rolesService.softDelete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }

    @HasPermissions(Permission.UpdateRole)
    @Patch('/:id/permission')
    @HttpCode(HttpStatus.OK)
    async updatePermission(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateRoleCapabilitiesDto,
    ): Promise<ResponseResultType<Role>> {
        const result = await this.rolesService.updatePermission(id, dto);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }
}
