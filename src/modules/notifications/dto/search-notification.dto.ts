import { PageOptionsDto } from '@common/dto/page-options.dto';
import { IntersectionType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class SearchNotificationDto {
    @IsOptional()
    notificationType: string;

    @IsOptional()
    senderType: string;

    @IsOptional()
    senderKey: string;

    @IsOptional()
    receiverType: string;

    @IsOptional()
    receiverKey: string;
}

export class QueryDto extends IntersectionType(PageOptionsDto, SearchNotificationDto) {}
