import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomTypeDto } from './create-roomtype.dto';

export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {}
