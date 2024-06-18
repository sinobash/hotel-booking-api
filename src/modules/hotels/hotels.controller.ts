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
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Hotel } from './entities/hotel.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchHotelDto } from './dto/search-hotel.dto';
import { CRUD_MESSAGES } from '@common/constants/app.constants';

/**
 * Guest side hotel controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'hotels',
})
export class HotelsController {
    /**
     * @ignore
     */
    constructor(private readonly hotelsService: HotelsService) {}

    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllBy(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchHotelDto,
    ): Promise<PageDto<Hotel>> {
        searchDto.hotelId = 0;
        return await this.hotelsService.findAllBy(pageOptionsDto, searchDto);
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Hotel>> {
        const result = await this.hotelsService.findDetailById(id);
        const message = `hotel data has been found`;
        return { message: message, data: result };
    }

    @Get('/facilities/hotel/:id')
    @HttpCode(HttpStatus.OK)
    async findFacilitiesByHotelId(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.hotelsService.findFacilitiesByHotelId(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/facilities/:id')
    @HttpCode(HttpStatus.OK)
    async findFacilitiesById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.hotelsService.findFacilityById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/files/hotel/:id')
    @HttpCode(HttpStatus.OK)
    async findMediasByHotelId(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.hotelsService.findMediasByHotelId(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/file/:id')
    @HttpCode(HttpStatus.OK)
    async findMediaById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const hotelId = 0;
        const result = await this.hotelsService.findMediaById(id, hotelId);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }
}
