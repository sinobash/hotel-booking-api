import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { RoomTypesService } from './roomtypes.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RoomType } from './entities/roomtype.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchRoomTypeDto } from './dto/search-roomtype.dto';
import { CRUD_MESSAGES } from '@common/constants/app.constants';

/**
 * Guest side room type controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'room-types',
})
export class RoomtypesController {
    /**
     * @ignore
     */
    constructor(private readonly roomTypesService: RoomTypesService) {}

    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchRoomTypeDto,
    ): Promise<PageDto<RoomType>> {
        return await this.roomTypesService.findAllBy(pageOptionsDto, searchDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<RoomType>> {
        const result = await this.roomTypesService.findById(id);
        const message = `room type with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @Get('/features/room-type/:id')
    @HttpCode(HttpStatus.OK)
    async findFacilitiesByHotelId(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomTypesService.findFeaturesByRoomTypeId(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/features/:id')
    @HttpCode(HttpStatus.OK)
    async findFacilitiesById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomTypesService.findFeatureById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/files/room-type/:id')
    @HttpCode(HttpStatus.OK)
    async findMediasByHotelId(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomTypesService.findMediasByRoomTypeId(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/file/:id')
    @HttpCode(HttpStatus.OK)
    async findMediaById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomTypesService.findMediaById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }
}
