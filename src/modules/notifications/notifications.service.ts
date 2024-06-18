import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SearchNotificationDto } from './dto/search-notification.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import AppError from '@common/errors/app.error';

@Injectable()
export class NotificationsService {
    private readonly className: string = 'notification';
    constructor(
        @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private eventEmitter: EventEmitter2,
    ) {}

    async toDatabase(payload: CreateNotificationDto): Promise<Notification> {
        const notification = await this.notificationRepository.save(
            this.notificationRepository.create({
                type: payload.notificationType,
                senderType: payload.senderType,
                senderKey: payload.senderKey,
                receiverType: payload.receiverType,
                receiverKey: payload.receiverKey,
                data: payload.data,
            }),
        );
        this.logger.log(`notification created successfully`);
        return notification;
    }

    async handleEmitEvent(payload: CreateNotificationDto): Promise<void> {
        this.eventEmitter.emit(payload.notificationType, payload);
    }

    async findAllSpecificHotel(hotelCode: string): Promise<Notification[]> {
        return await this.notificationRepository.find({
            where: {
                receiverType: 'hotel',
                receiverKey: hotelCode,
            },
            withDeleted: false,
        });
    }

    async findAllBy(pageOptionsDto: PageOptionsDto, searchDto: SearchNotificationDto): Promise<PageDto<Notification>> {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.select([
            'notification.id',
            'notification.type',
            'notification.senderType',
            'notification.senderKey',
            'notification.receiverType',
            'notification.receiverKey',
            'notification.data',
            'notification.readAt',
            'notification.createdAt',
            'notification.deletedAt',
        ]);

        if (searchDto.notificationType) {
            queryBuilder.where('notification.type =:notificationType', {
                notificationType: searchDto.notificationType,
            });
        } else {
            queryBuilder.where('notification.type IS NOT NULL');
        }

        if (searchDto.senderType) {
            queryBuilder.andWhere('notification.senderType =:senderType', { senderType: searchDto.senderType });

            if (searchDto.senderKey) {
                queryBuilder.andWhere('notification.senderKey =:senderKey', { senderKey: searchDto.senderKey });
            }
        }

        if (searchDto.receiverType) {
            queryBuilder.andWhere('notification.receiverType =:receiverType', { receiverType: searchDto.receiverType });

            if (searchDto.receiverKey) {
                queryBuilder.andWhere('notification.receiverKey =:receiverKey', { receiverKey: searchDto.receiverKey });
            }
        }

        queryBuilder
            .orderBy('notification.createdAt', pageOptionsDto.order)
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take);

        const total = await queryBuilder.getCount();
        const { entities } = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ pageOptionsDto, total });

        const pageCount = pageMetaDto.pageCount;

        if (pageCount >= pageMetaDto.page) {
            return new PageDto(entities, pageMetaDto);
        } else {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
    }

    async findOne(fields: EntityCondition<Notification>): Promise<NullableType<Notification>> {
        const data = await this.notificationRepository.findOne({
            where: fields,
        });
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return data;
    }

    async updateReadAt(id: number): Promise<Notification> {
        const notification = await this.findOne({ id: id });
        notification.readAt = new Date();
        await notification.save();
        return notification;
    }
}
