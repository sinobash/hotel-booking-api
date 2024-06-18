import {
    Controller,
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
    DefaultValuePipe,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ResponseResultType } from '@common/types/response-result.type';
import { Currency } from './entities/currency.entity';
import { CRUD_MESSAGES } from '@common/constants/app.constants';

/**
 * Guest side currency controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'currencies',
})
export class CurrenciesController {
    /**
     * @ignore
     */
    constructor(private readonly currenciesService: CurrenciesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<Currency[]>> {
        const results = await this.currenciesService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: results };
    }

    @Get('/search')
    @HttpCode(HttpStatus.OK)
    async findAllBy(@Query('code', new DefaultValuePipe('')) code: string): Promise<ResponseResultType<Currency[]>> {
        const results = await this.currenciesService.findBy({ code: code });
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: results };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Currency>> {
        const result = await this.currenciesService.findOne({ id: +id });
        const message = `currency with value ${result.code} has been found`;
        return { message: message, data: result };
    }
}
