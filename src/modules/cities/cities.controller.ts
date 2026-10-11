import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
    ParseIntPipe,
    UseInterceptors,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ResponseResultType } from '@common/types/response-result.type';
import { City } from './entities/city.entity';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchCityDto } from './dto/search-city.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Guest side city controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'cities',
})
export class CitiesController {
    /**
     * @ignore
     */
    constructor(private readonly citiesService: CitiesService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(60_000)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<City>> {
        return await this.citiesService.paginate(pageOptionsDto);
    }

    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchCityDto,
    ): Promise<PageDto<City>> {
        return await this.citiesService.paginate(pageOptionsDto, searchDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<City>> {
        const result = await this.citiesService.findById(id);
        const message = `city with value ${result.name} has been found`;
        return { message: message, data: result };
    }
}
