import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { RoomFeatures } from './entities/room-features.entity';
import { HotelsService } from '@modules/hotels/hotels.service';
import { RoomTypesService } from '@modules/roomtypes/roomtypes.service';
import { FeaturesService } from '@modules/features/features.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { SearchRoomDto } from './dto/search-room.dto';
import { PageDto } from '@common/dto/page.dto';
import { NullableType } from '@common/types/nullable.type';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';
import { HouseKeepingStatusUpdatedEvent } from '@modules/notifications/events/room.event';
import { CreateNotificationDto } from '@modules/notifications/dto/create-notification.dto';
import { ROOM_EVENTS } from '@common/constants/event.constants';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import AppError from '@common/errors/app.error';

@Injectable()
export class RoomsService {
    private readonly className: string = 'room';
    constructor(
        @InjectRepository(Room) private readonly roomsRepository: Repository<Room>,
        @InjectRepository(RoomFeatures) private readonly roomFeaturesRepository: Repository<RoomFeatures>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly hotelsService: HotelsService,
        private readonly roomTypeService: RoomTypesService,
        private readonly featuresService: FeaturesService,
        private readonly notificationService: NotificationsService,
    ) {}

    async create(payload: CreateRoomDto, hotelId: number): Promise<Room> {
        const hotel = await this.hotelsService.findOne({ id: hotelId });
        const roomType = await this.roomTypeService.findOne({
            id: payload.roomTypeId,
            hotel: {
                id: hotel.id,
            },
        });
        const room = await this.roomsRepository.save(
            this.roomsRepository.create({
                ...payload,
                roomType: roomType,
            }),
        );
        this.addFeatures(room.id, payload.featureIds);
        this.logger.log(`room ${room.code} created successfully`);
        return await this.findById(room.id);
    }

    async findAllBy(pageOptionsDto: PageOptionsDto, searchDto: SearchRoomDto): Promise<PageDto<NullableType<Room>>> {
        const queryBuilder = this.roomsRepository.createQueryBuilder('room');
        queryBuilder
            .leftJoin('room.roomType', 'roomType')
            .leftJoin('roomType.hotel', 'hotel')
            .select([
                'room.id',
                'room.code',
                'room.isAvailable',
                'room.floorNumber',
                'room.bedType',
                'room.houseKeepingStatus',
                'roomType.name',
            ]);

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }

        if (searchDto.code) {
            queryBuilder.andWhere('room.code =:code', { code: searchDto.code });
        }

        if (searchDto.roomTypeId > 0) {
            queryBuilder.andWhere('roomType.id =:roomTypeId', { roomTypeId: searchDto.roomTypeId });
        }

        if (searchDto.roomFloor > 0) {
            queryBuilder.andWhere('room.floorNumber =:roomFloor', { roomFloor: searchDto.roomFloor });
        }

        if (searchDto.bedType) {
            queryBuilder.andWhere('room.bedType =:bedType', { bedType: searchDto.bedType });
        }

        if (searchDto.houseKeepingStatus) {
            queryBuilder.andWhere('room.houseKeepingStatus =:houseKeepingStatus', {
                houseKeepingStatus: searchDto.houseKeepingStatus,
            });
        }

        if (searchDto.isAvailable > -1) {
            queryBuilder.andWhere('room.isAvailable =:isAvailable', { isAvailable: searchDto.isAvailable });
        }

        queryBuilder.orderBy('room.id', pageOptionsDto.order).skip(pageOptionsDto.skip).take(pageOptionsDto.take);

        const total = await queryBuilder.getCount();
        queryBuilder.cache(this.configService.get<string>('app.nodeEnv') === 'production'); // Caching queries
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

    async findOne(fields: EntityCondition<Room>): Promise<NullableType<Room>> {
        const data = await this.roomsRepository.findOne({
            where: fields,
            relations: {
                roomType: {
                    hotel: true,
                },
            },
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

    async findById(id: number): Promise<NullableType<Room>> {
        const queryBuilder = this.roomsRepository.createQueryBuilder('room');
        queryBuilder
            .select([
                'room.id',
                'room.code',
                'room.isAvailable',
                'room.floorNumber',
                'room.bedType',
                'room.houseKeepingStatus',
                'roomType.name',
                'roomType.price',
            ])
            .leftJoin('room.roomType', 'roomType')
            .leftJoin('roomType.hotel', 'hotel')
            .where('room.id =:id', { id: id });

        const data = await queryBuilder.getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async findHotelByRoomTypeId(id: number): Promise<NullableType<RoomType>> {
        return await this.roomTypeService.findHotelById(id);
    }

    async findHotelById(id: number): Promise<NullableType<RoomType>> {
        const room = await this.findOne({ id: id });
        return await this.roomTypeService.findHotelById(room.roomType.id);
    }

    async findByIds(ids: number[]): Promise<NullableType<Room[]>> {
        const queryBuilder = this.roomsRepository.createQueryBuilder('room');
        const data = await queryBuilder
            .select([
                'room.id',
                'room.code',
                'room.isAvailable',
                'room.floorNumber',
                'room.bedType',
                'room.houseKeepingStatus',
                'roomType.name',
                'roomType.price',
            ])
            .leftJoin('room.roomType', 'roomType')
            .where('room.id IN (:...ids)', { ids: ids })
            .getMany();
        return data;
    }

    async findWithFeaturesById(id: number): Promise<NullableType<Room>> {
        const queryBuilder = this.roomsRepository.createQueryBuilder('room');
        const data = await queryBuilder
            .select([
                'room.id',
                'room.code',
                'room.isAvailable',
                'room.floorNumber',
                'room.bedType',
                'room.houseKeepingStatus',
                'roomType.name',
                'features.name',
                'features.icon',
            ])
            .leftJoin('room.roomType', 'roomType')
            .leftJoin('room.features', 'features')
            .where('room.id =:id', { id: id })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async update(id: number, payload: UpdateRoomDto): Promise<Room> {
        try {
            const room = await this.roomsRepository.preload({
                id: id,
                ...payload,
            });
            if (!room) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.roomsRepository.save(room);
            this.logger.log(`room ${room.code} updated successfully`);
            return await this.findById(room.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async updateStatus(id: number, isAvailable: number): Promise<Room> {
        try {
            const room = await this.findOne({ id: id });
            room.isAvailable = isAvailable;
            await room.save();
            return await this.findById(room.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async updateHouseKeepingStatus(id: number, status: string, currentUser: AdminUserData): Promise<Room> {
        try {
            const room = await this.findOne({ id: id });
            room.houseKeepingStatus = status;
            await room.save();

            // store and emit create booking notification
            const houseKeepingStatusUpdatedEvent = new HouseKeepingStatusUpdatedEvent();
            houseKeepingStatusUpdatedEvent.roomId = room.roomType.hotel.code;
            houseKeepingStatusUpdatedEvent.code = room.code;
            houseKeepingStatusUpdatedEvent.name = room.houseKeepingStatus;
            houseKeepingStatusUpdatedEvent.message = `Room housekeeping status change to ${status}`;

            const createNotificationDto: CreateNotificationDto = {
                notificationType: ROOM_EVENTS.HOUSEKEEPING_STATUS_UPDATED,
                senderType: 'user',
                senderKey: currentUser.umail,
                receiverType: 'hotel',
                receiverKey: room.roomType.hotel.code,
                data: houseKeepingStatusUpdatedEvent,
            };

            await this.notificationService.toDatabase(createNotificationDto);
            await this.notificationService.handleEmitEvent(createNotificationDto);

            return await this.findById(room.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async delete(id: number): Promise<number> {
        const deleteResponse = await this.roomsRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`room deleted successfully`);
        return 1;
    }

    async addFeatures(roomId: number, featureIds: number[]): Promise<void> {
        if (Array.isArray(featureIds) && featureIds.length > 0) {
            const room = await this.findOne({ id: roomId });
            for (const featureId of featureIds) {
                const feature = await this.featuresService.findOne({ id: featureId });
                const createRoomFeature = { name: feature.name, icon: feature.icon, room: room };
                await this.roomFeaturesRepository.save(this.roomFeaturesRepository.create(createRoomFeature));
                this.logger.log(`room ${room.code} features created successfully`);
            }
        }
    }

    async updateFeatures(roomId: number, featureIds: number[]): Promise<void> {
        if (Array.isArray(featureIds) && featureIds.length > 0) {
            const room = await this.findOne({ id: roomId });
            for (const featureId of featureIds) {
                const feature = await this.featuresService.findOne({ id: featureId });
                const roomFeature = await this.roomFeaturesRepository.findOne({ where: { icon: feature.icon } });
                if (!roomFeature) {
                    const createRoomFeature = { name: feature.name, icon: feature.icon, room: room };
                    await this.roomFeaturesRepository.save(this.roomFeaturesRepository.create(createRoomFeature));
                }
            }
            this.logger.log(`room ${room.code} features updated successfully`);
        }
    }

    async deleteFeatures(roomId: number): Promise<void> {
        const queryBuilder = this.roomFeaturesRepository.createQueryBuilder('roomFeatures');
        await queryBuilder.delete().from(RoomFeatures).where('room_id = :roomId', { roomId: roomId }).execute();
        this.logger.log(`room features deleted successfully`);
    }

    async findFeaturesByRoomId(roomId: number): Promise<RoomFeatures[]> {
        return await this.roomFeaturesRepository.find({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            where: { room: { id: roomId } },
        });
    }

    async findFeatureById(id: number): Promise<RoomFeatures[]> {
        return await this.roomFeaturesRepository.find({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            where: { id: id },
        });
    }
}
