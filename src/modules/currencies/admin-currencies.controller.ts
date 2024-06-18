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
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { Currency } from './entities/currency.entity';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side currency controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/currencies',
})
export class AdminCurrenciesController {
    /**
     * @ignore
     */
    constructor(private readonly currenciesService: CurrenciesService) {}

    @HasPermissions(Permission.CreateCurrency)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() payload: CreateCurrencyDto): Promise<ResponseResultType<Currency>> {
        const result = await this.currenciesService.create(payload);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.ReadCurrency)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<Currency[]>> {
        const results = await this.currenciesService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: results };
    }

    @HasPermissions(Permission.ReadCurrency)
    @Get('/search')
    @HttpCode(HttpStatus.OK)
    async findAllBy(@Query('code', new DefaultValuePipe('')) code: string): Promise<ResponseResultType<Currency[]>> {
        const results = await this.currenciesService.findBy({ code: code });
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: results };
    }

    @HasPermissions(Permission.ReadCurrency)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Currency>> {
        const result = await this.currenciesService.findOne({ id: +id });
        const message = `currency with value ${result.code} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateCurrency)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateCurrencyDto,
    ): Promise<ResponseResultType<Currency>> {
        const result = await this.currenciesService.update(id, payload);
        const message = CRUD_MESSAGES.DATA_UPDATED;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.DeleteCurrency)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.currenciesService.delete(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
