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
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { City } from './entities/city.entity';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchCityDto } from './dto/search-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side city controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/cities',
})
export class AdminCitiesController {
    /**
     * @ignore
     */
    constructor(private readonly citiesService: CitiesService) {}

    @HasPermissions(Permission.CreateCity)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateCityDto): Promise<ResponseResultType<City>> {
        const result = await this.citiesService.create(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadCity)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<City>> {
        return await this.citiesService.paginate(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadCity)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchCityDto,
    ): Promise<PageDto<City>> {
        return await this.citiesService.paginate(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadCity)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<City>> {
        const result = await this.citiesService.findById(id);
        const message = `city with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateCity)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCityDto: UpdateCityDto,
    ): Promise<ResponseResultType<City>> {
        const result = await this.citiesService.update(id, updateCityDto);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteCity)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.citiesService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
