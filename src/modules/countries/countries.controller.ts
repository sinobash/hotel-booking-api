import { Controller, Get, Post, Body, HttpCode, HttpStatus, Query, Param, ParseIntPipe } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { Country } from './entities/country.entity';
import { SearchCountryDto } from './dto/search-country.dto';
import { ResponseResultType } from '@common/types/response-result.type';

/**
 * Guest side country controller
 */
@Controller({
    path: 'countries',
})
export class CountriesController {
    /**
     * @ignore
     */
    constructor(private readonly countriesService: CountriesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<Country[]>> {
        const result = await this.countriesService.findAll();
        const message = `country data has been found`;
        return { message: message, data: result };
    }

    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchCountryDto,
    ): Promise<PageDto<Country>> {
        return await this.countriesService.paginate(pageOptionsDto, searchDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Country>> {
        const result = await this.countriesService.findById(id);
        const message = `country with value ${result.code} has been found`;
        return { message: message, data: result };
    }
}
