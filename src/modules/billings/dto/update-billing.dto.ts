import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingReqDto } from './create-billing.dto';

export class UpdateBillingDto extends PartialType(CreateBillingReqDto) {}
