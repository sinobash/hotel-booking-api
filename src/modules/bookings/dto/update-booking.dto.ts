import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingReqDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingReqDto) {}
