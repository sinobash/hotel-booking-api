import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { Facility } from './entities/facility.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * Guest side facility controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'facilities',
})
export class FacilitiesController {
    /**
     * @ignore
     */
    constructor(private readonly facilitiesService: FacilitiesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Facility>> {
        return await this.facilitiesService.paginate(pageOptionsDto);
    }
}
