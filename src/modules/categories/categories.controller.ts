import { Controller, Get, UseGuards, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ResponseResultType } from '@common/types/response-result.type';
import { CRUD_MESSAGES } from '@common/constants/app.constants';
import { DetailCategoryResDto } from './dto/create-category.dto';

/**
 * Guest side hotel category controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'categories',
})
export class CategoriesController {
    /**
     * @ignore
     */
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseResultType<DetailCategoryResDto[]>> {
        const result = await this.categoriesService.findAll();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<DetailCategoryResDto>> {
        const result = await this.categoriesService.findDetailById(id);
        const message = `category with value ${result.categoryName} has been found`;
        return { message: message, data: result };
    }
}
