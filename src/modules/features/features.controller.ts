import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { Feature } from './entities/feature.entity';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * Guest side feature controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'features',
})
export class FeaturesController {
    /**
     * @ignore
     */
    constructor(private readonly featuresService: FeaturesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Feature>> {
        return await this.featuresService.paginate(pageOptionsDto);
    }
}
