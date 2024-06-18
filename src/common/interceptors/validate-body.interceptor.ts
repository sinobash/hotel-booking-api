import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import _ from 'lodash';
import { FORBIDDEN_MESSAGES } from '@common/constants/app.constants';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';

@Injectable()
export class ValidateBodyInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request & { user: AdminUserData }>();
        if (!_.isEmpty(request.body)) {
            if (request.body.hotelId) {
                if (request.user.urole !== RoleEnum.ADMIN && request.user.ubranch !== Number(request.body.hotelId)) {
                    throw new UnauthorizedException(FORBIDDEN_MESSAGES.FORBIDDEN_BRANCH_ACCESS);
                }
                throw new UnauthorizedException(FORBIDDEN_MESSAGES.FORBIDDEN_ACCESS);
            } else if (request.body.roomTypeId) {
                const hotelId = next.handle().pipe(
                    map((data) =>
                        data.map((roomType: RoomType) => {
                            return roomType.hotel.id;
                        }),
                    ),
                );
                if (request.user.urole !== RoleEnum.ADMIN && request.user.ubranch !== Number(hotelId)) {
                    throw new UnauthorizedException(FORBIDDEN_MESSAGES.FORBIDDEN_BRANCH_ACCESS);
                }
            } else {
                throw new UnauthorizedException(FORBIDDEN_MESSAGES.FORBIDDEN_ACCESS);
            }
        }
        return next.handle();
    }
}
