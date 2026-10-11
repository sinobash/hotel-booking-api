import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { FORBIDDEN_MESSAGES } from '@common/constants/app.constants';
import { HotelsService } from '@modules/hotels/hotels.service';
import { RoomTypesService } from '@modules/roomtypes/roomtypes.service';
import { ApiException } from '@common/exceptions/api.exception';

@Injectable()
export class ValidateParamsInterceptor implements NestInterceptor {
    constructor(
        private readonly hotelsService: HotelsService,
        private readonly roomTypesService: RoomTypesService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request & { user: AdminUserData }>();
        if (Object.keys(request.params ?? {}).length > 0) {
            this.validateAccess(request);
        }
        return next.handle();
    }

    private validateBranch = (request: any, key: number) => {
        if (request.user.role !== RoleEnum.ADMIN && request.user.branch !== Number(key)) {
            throw new UnauthorizedException(FORBIDDEN_MESSAGES.FORBIDDEN_BRANCH_ACCESS);
        }
    };

    private validateAccess = async (request: any) => {
        try {
            if (request.params.hotelId) {
                const hotelId = Number(request.params.hotelId);
                this.validateBranch(request, hotelId);
            } else if (request.params.roomTypeId) {
                const roomTypeId = Number(request.params.roomTypeId);
                const roomType = await this.roomTypesService.findHotelById(roomTypeId);
                if (!roomType) {
                    throw new NotFoundException(`room type with id ${roomTypeId} cannot be found`);
                }
                const hotelId = roomType.hotel.id;
                this.validateBranch(request, hotelId);
            } else {
                throw new UnauthorizedException(FORBIDDEN_MESSAGES.FORBIDDEN_ACCESS);
            }
        } catch (error) {
            throw new ApiException(error);
        }
    };
}
