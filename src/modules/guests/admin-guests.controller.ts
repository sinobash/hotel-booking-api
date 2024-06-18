import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { ResponseResultType } from '@common/types/response-result.type';
import { Guest } from './entities/guest.entity';
import { CurrentUser } from '@common/decorators/user.decorator';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchGuestDto } from './dto/search-guest.dto';
import { HasRoles } from '@modules/admin/decorators/has-roles.decorator';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HasPermissions } from '@modules/admin/decorators/has-permissions.decorator';
import Permission from '@modules/roles/enums/permission.type';

/**
 * Admin side guest controller
 */
@HasRoles(RoleEnum.ADMIN, RoleEnum.BACK, RoleEnum.FRONT, RoleEnum.HOUSEKEEPING)
@Controller({
    path: 'admin/guests',
})
export class AdminGuestsController {
    /**
     * @ignore
     */
    constructor(private readonly guestsService: GuestsService) {}

    @HasPermissions(Permission.CreateGuest)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Guest>> {
        return await this.guestsService.findAllBy(pageOptionsDto);
    }

    @HasPermissions(Permission.ReadGuest)
    @Post('/search')
    @HttpCode(HttpStatus.OK)
    async findAllSearch(
        @Query() pageOptionsDto: PageOptionsDto,
        @Body() searchDto: SearchGuestDto,
    ): Promise<PageDto<Guest>> {
        return await this.guestsService.findAllBy(pageOptionsDto, searchDto);
    }

    @HasPermissions(Permission.ReadGuest)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<ResponseResultType<Guest>> {
        const result = await this.guestsService.findById(id);
        const message = `guest with data ${result.fullName} has been found`;
        return { message: message, data: result };
    }

    @HasPermissions(Permission.UpdateGuest)
    @Post('/verify-document')
    @HttpCode(HttpStatus.OK)
    async verifyDocument(@CurrentUser() user: AdminUserData, @Body() payload: { guestId: number }): Promise<any> {
        const result = await this.guestsService.verifyDocument(payload.guestId, user.uid);
        const message = `Verify document successful`;
        return { message: message, data: result };
    }
}
