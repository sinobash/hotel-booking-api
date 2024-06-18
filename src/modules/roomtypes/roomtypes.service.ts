import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateRoomTypeDto } from './dto/create-roomtype.dto';
import { UpdateRoomTypeDto } from './dto/update-roomtype.dto';
import { RoomType } from './entities/roomtype.entity';
import { HotelsService } from '@modules/hotels/hotels.service';
import { FeaturesService } from '@modules/features/features.service';
import { FilesService } from '@modules/files/files.service';
import { SearchRoomTypeDto } from './dto/search-roomtype.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import { RoomTypeFeatures } from './entities/roomtype-features.entity';
import { RoomTypeMedia } from './entities/roomtype-medias.entity';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { generateUUID } from '@common/utils/crypt.helper';
import AppError from '@common/errors/app.error';

@Injectable()
export class RoomTypesService {
    private readonly className: string = 'room type';
    constructor(
        @InjectRepository(RoomType) private readonly roomTypesRepository: Repository<RoomType>,
        @InjectRepository(RoomTypeFeatures) private readonly roomTypeFeaturesRepository: Repository<RoomTypeFeatures>,
        @InjectRepository(RoomTypeMedia) private readonly roomTypeMediasRepository: Repository<RoomTypeMedia>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly hotelsService: HotelsService,
        private readonly featuresService: FeaturesService,
        private readonly filesService: FilesService,
    ) {}

    async create(payload: CreateRoomTypeDto): Promise<RoomType> {
        const hotel = await this.hotelsService.findOne({ id: payload.hotelId });
        const roomType = await this.roomTypesRepository.save(
            this.roomTypesRepository.create({
                ...payload,
                hotel: hotel,
            }),
        );
        this.addFeatures(hotel.id, payload.featureIds);
        this.logger.log(`room type ${roomType.name} created successfully`);
        return this.findById(roomType.id);
    }

    async findAllBy(pageOptionsDto: PageOptionsDto, searchDto: SearchRoomTypeDto): Promise<PageDto<RoomType>> {
        const queryBuilder = this.roomTypesRepository.createQueryBuilder('roomType');
        queryBuilder
            .select(['roomType.id', 'roomType.name', 'roomType.price', 'roomType.capacity'])
            .leftJoin('roomType.hotel', 'hotel');

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }

        if (searchDto.name) {
            queryBuilder.andWhere('LOWER(roomType.name) like :name', { name: `%${searchDto.name.toLowerCase()}%` });
        }

        queryBuilder.orderBy('roomType.id', pageOptionsDto.order).skip(pageOptionsDto.skip).take(pageOptionsDto.take);

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

    async findOne(fields: EntityCondition<RoomType>): Promise<NullableType<RoomType>> {
        const data = await this.roomTypesRepository.findOne({
            where: fields,
            relations: {
                hotel: true,
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

    async findById(id: number): Promise<NullableType<RoomType>> {
        const queryBuilder = this.roomTypesRepository.createQueryBuilder('roomType');
        queryBuilder
            .select(['roomType.id', 'roomType.name', 'roomType.price', 'roomType.capacity'])
            .where('roomType.id =:id', { id: +id });

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

    async findHotelById(id: number): Promise<NullableType<RoomType>> {
        const queryBuilder = this.roomTypesRepository.createQueryBuilder('roomType');
        queryBuilder
            .select(['roomType.id', 'roomType.name', 'roomType.price', 'roomType.capacity', 'hotel.id', 'hotel.code'])
            .leftJoin('roomType.hotel', 'hotel')
            .where('roomType.id =:id', { id: +id });

        const data = await queryBuilder.getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} hotel data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async findDetailById(id: number): Promise<any> {
        const roomType = await this.roomTypesRepository.findOne({
            where: {
                id: id,
            },
            relations: {
                hotel: true,
                medias: true,
                features: true,
            },
            cache: true,
        });
        if (!roomType) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const hotel = await this.hotelsService.findOne({ id: roomType.hotel.id });

        const roomTypeImages = await Promise.all(
            roomType.medias
                ? roomType.medias.map(async (m: RoomTypeMedia) => await this.filesService.getFileLinkByUrl(m.url))
                : [],
        );

        return {
            hotelName: hotel.name,
            cityName: hotel.city.name,
            roomTypeId: roomType.id,
            roomTypeName: roomType.name,
            roomTypePrice: roomType.price,
            roomTypeCapacity: roomType.capacity,
            roomTypeImages: roomTypeImages,
            roomTypeFeatures: roomType.features,
        };
    }

    async findWithFeaturesById(id: number, hotelId: number): Promise<NullableType<RoomType>> {
        const queryBuilder = this.roomTypesRepository.createQueryBuilder('roomType');
        queryBuilder
            .select([
                'roomType.id',
                'roomType.name',
                'roomType.price',
                'roomType.capacity',
                'hotel.name',
                'features.name',
                'features.icon',
            ])
            .leftJoin('roomType.hotel', 'hotel')
            .leftJoin('roomType.features', 'features')
            .where('roomType.id =:id', { id: id });

        if (hotelId !== 0) {
            queryBuilder.andWhere('hotel.id =:id', { id: hotelId });
        } else {
            queryBuilder.andWhere('hotel.id IS NOT NULL');
        }

        const data = await queryBuilder.getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} features data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async update(id: number, payload: UpdateRoomTypeDto): Promise<RoomType> {
        try {
            const roomType = await this.roomTypesRepository.preload({
                id: id,
                ...payload,
            });
            if (!roomType) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.roomTypesRepository.save(roomType);
            this.logger.log(`room type ${roomType.name} updated successfully`);
            return await this.findById(roomType.id);
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
        const deleteResponse = await this.roomTypesRepository.delete({ id: id });
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`room type deleted successfully`);
        return 1;
    }

    async addFeatures(roomTypeId: number, featureIds: number[]): Promise<void> {
        if (Array.isArray(featureIds) && featureIds.length > 0) {
            const roomType = await this.findOne({ id: roomTypeId });
            for (const featureId of featureIds) {
                const feature = await this.featuresService.findOne({ id: featureId });
                const createRoomTypeFeature = { name: feature.name, icon: feature.icon, roomType: roomType };
                await this.roomTypeFeaturesRepository.save(
                    this.roomTypeFeaturesRepository.create(createRoomTypeFeature),
                );
                this.logger.log(`room type ${roomType.name} features created successfully`);
            }
        }
    }

    async updateFeatures(roomTypeId: number, featureIds: number[]): Promise<void> {
        if (Array.isArray(featureIds) && featureIds.length > 0) {
            const roomType = await this.findOne({ id: roomTypeId });
            for (const featureId of featureIds) {
                const feature = await this.featuresService.findOne({ id: featureId });
                const roomTypeFeature = await this.roomTypeFeaturesRepository.findOne({
                    where: { icon: feature.icon },
                });
                if (!roomTypeFeature) {
                    const createRoomTypeFeature = { name: feature.name, icon: feature.icon, roomType: roomType };
                    await this.roomTypeFeaturesRepository.save(
                        this.roomTypeFeaturesRepository.create(createRoomTypeFeature),
                    );
                }
            }
            this.logger.log(`room type ${roomType.name} features updated successfully`);
        }
    }

    async deleteFeatures(roomTypeId: number): Promise<void> {
        const queryBuilder = this.roomTypeFeaturesRepository.createQueryBuilder('roomTypeFeature');
        await queryBuilder
            .delete()
            .from(RoomTypeFeatures)
            .where('room_type_id = :roomTypeId', { roomTypeId: roomTypeId })
            .execute();
        this.logger.log(`room type features deleted successfully`);
    }

    async findFeaturesByRoomTypeId(roomTypeId: number): Promise<RoomTypeFeatures[]> {
        return await this.roomTypeFeaturesRepository.find({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            where: { roomType: { id: roomTypeId } },
        });
    }

    async findFeatureById(id: number): Promise<RoomTypeFeatures[]> {
        return await this.roomTypeFeaturesRepository.find({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            where: { id: id },
        });
    }

    async uploadMedia(fileGroup: string, payload: ImageFileDTO, roomTypeId: number): Promise<RoomTypeMedia> {
        const roomType = await this.findOne({ id: roomTypeId });
        const filePath = `assets/${fileGroup}/${generateUUID()}-${payload.originalname}`;

        await this.filesService.uploadToS3(payload.buffer, filePath, payload.mimetype);
        const fileUrl = await this.filesService.createFileLink(filePath);

        const fileStored = await this.roomTypeMediasRepository.save(
            this.roomTypeMediasRepository.create({
                name: payload.originalname,
                url: fileUrl,
                key: filePath,
                type: payload.mimetype,
                roomType: roomType,
            }),
        );

        return fileStored;
    }

    async findMediasByRoomTypeId(roomTypeId: number) {
        const files = await this.roomTypeMediasRepository.find({ where: { roomType: { id: roomTypeId } } });
        if (!files) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} media data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return Promise.all(
            files.map(async (file) => {
                const { id, name, type, url, createdAt, updatedAt } = file;
                const fileLink = url ? await this.filesService.getFileLinkByUrl(url) : null;
                return {
                    id,
                    name,
                    type,
                    url: fileLink,
                    createdAt,
                    updatedAt,
                };
            }),
        );
    }

    async findMediaById(fileId: number) {
        const fileInfo = await this.roomTypeMediasRepository.findOne({ where: { id: fileId } });
        if (!fileInfo) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} media data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const { id, name, type, url, createdAt, updatedAt } = fileInfo;
        const fileLink = url ? await this.filesService.getFileLinkByUrl(url) : null;
        return {
            id,
            name,
            type,
            url: fileLink,
            createdAt,
            updatedAt,
        };
    }

    async deleteFile(fileId: number): Promise<number> {
        const file = await this.roomTypeMediasRepository.findOne({
            where: { id: fileId },
        });
        if (!file) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} media data with parameter {${fileId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        const deleteResult = await this.filesService.deleteFromS3(file.key);
        if (deleteResult > 0) {
            const deleteResponse = await this.roomTypeMediasRepository.delete(fileId);
            if (!deleteResponse.affected) {
                return 0;
            }
            return 1;
        }
        return 0;
    }
}
