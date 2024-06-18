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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { Facility } from './entities/facility.entity';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchFacilityDto } from './dto/search-facility.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side facility controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/facilities',
})
export class AdminFacilitiesController {
    /**
     * @ignore
     */
    constructor(private readonly facilitiesService: FacilitiesService) {}

    @HasPermissions(Permission.CreateFacility)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateFacilityDto): Promise<ResponseResultType<Facility>> {
        const result = await this.facilitiesService.create(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadFacility)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Facility>> {
        return await this.facilitiesService.paginate(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadFacility)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchFacilityDto,
    ): Promise<PageDto<Facility>> {
        return await this.facilitiesService.paginate(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadFacility)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Facility>> {
        const result = await this.facilitiesService.findById(id);
        const message = `facility with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateFacility)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFacilityDto: UpdateFacilityDto,
    ): Promise<ResponseResultType<Facility>> {
        const result = await this.facilitiesService.update(id, updateFacilityDto);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteFacility)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.facilitiesService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
