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
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Room } from './entities/room.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchRoomDto } from './dto/search-room.dto';
import { CRUD_MESSAGES } from '@common/constants/app.constants';

/**
 * Guest side room controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'rooms',
})
export class RoomsController {
    /**
     * @ignore
     */
    constructor(private readonly roomsService: RoomsService) {}

    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchRoomDto,
    ): Promise<PageDto<Room>> {
        searchDto.hotelId = 0;
        return await this.roomsService.findAllBy(pageOptionsDto, searchDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Room>> {
        const result = await this.roomsService.findById(id);
        const message = `room with value ${result.code} has been found`;
        return { message: message, data: result };
    }

    @Get('/features/room/:id')
    @HttpCode(HttpStatus.OK)
    async findFeaturesByRoomId(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomsService.findFeaturesByRoomId(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/features/:id')
    @HttpCode(HttpStatus.OK)
    async findFeaturesById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.roomsService.findFeatureById(id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }
}
