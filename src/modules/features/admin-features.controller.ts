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
import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { Feature } from './entities/feature.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchFeatureDto } from './dto/search-feature.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side feature controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/features',
})
export class AdminFeaturesController {
    /**
     * @ignore
     */
    constructor(private readonly featuresService: FeaturesService) {}

    @HasPermissions(Permission.CreateFeature)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateFeatureDto): Promise<ResponseResultType<Feature>> {
        const result = await this.featuresService.create(dto);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadFeature)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Feature>> {
        return await this.featuresService.paginate(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadFeature)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchFeatureDto,
    ): Promise<PageDto<Feature>> {
        return await this.featuresService.paginate(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadFeature)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Feature>> {
        const result = await this.featuresService.findById(id);
        const message = `feature with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateFeature)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFeatureDto: UpdateFeatureDto,
    ): Promise<ResponseResultType<Feature>> {
        const result = await this.featuresService.update(id, updateFeatureDto);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteFeature)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.featuresService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
