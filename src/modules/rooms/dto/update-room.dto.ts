import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HouseKeepingStatus } from '@common/enums/status.enum';
import { Transform } from 'class-transformer';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class UpdateRoomStatusDto {
    // @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(HouseKeepingStatus, { groups: ['all'] })
    houseKeepingStatus: HouseKeepingStatus;
}
