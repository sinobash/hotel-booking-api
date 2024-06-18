import { Controller, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { BannersService } from './banners.service';
import { DetailBannerResDto } from './dto/create-banner.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';

/**
 * Guest side banner controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'banners',
})
export class BannersController {
    /**
     * @ignore
     */
    constructor(private readonly bannersService: BannersService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<DetailBannerResDto[]>> {
        const result = await this.bannersService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }
}
