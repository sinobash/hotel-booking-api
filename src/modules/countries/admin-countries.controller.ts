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
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchCountryDto } from './dto/search-country.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side country controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/countries',
})
export class AdminCountriesController {
    /**
     * @ignore
     */
    constructor(private readonly countriesService: CountriesService) {}

    @HasPermissions(Permission.CreateCountry)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateCountryDto): Promise<ResponseResultType<Country>> {
        const result = await this.countriesService.create(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadCountry)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Country>> {
        return await this.countriesService.paginate(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadCountry)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchCountryDto,
    ): Promise<PageDto<Country>> {
        return await this.countriesService.paginate(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadCountry)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Country>> {
        const result = await this.countriesService.findById(id);
        const message = `country with value ${result.code} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateCountry)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCountryDto: UpdateCountryDto,
    ): Promise<ResponseResultType<Country>> {
        const result = await this.countriesService.update(id, updateCountryDto);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteCountry)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.countriesService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
