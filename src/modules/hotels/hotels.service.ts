import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { SearchHotelDto } from './dto/search-hotel.dto';
import { PageDto } from '@common/dto/page.dto';
import { NullableType } from '@common/types/nullable.type';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { CitiesService } from '@modules/cities/cities.service';
import { HotelFacilities } from './entities/hotel-facilities.entity';
import { FacilitiesService } from '@modules/facilities/facilities.service';
import { FilesService } from '@modules/files/files.service';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { generateUUID } from '@common/utils/crypt.helper';
import { HotelMedia } from './entities/hotel-medias.entity';
import { ConfigService } from '@nestjs/config';
import { CategoriesService } from '@modules/categories/categories.service';
import AppError from '@common/errors/app.error';

@Injectable()
export class HotelsService {
    private readonly className: string = 'hotel';
    constructor(
        @InjectRepository(Hotel) private readonly hotelsRepository: Repository<Hotel>,
        @InjectRepository(HotelFacilities) private readonly hotelFacilitiesRepository: Repository<HotelFacilities>,
        @InjectRepository(HotelMedia) private readonly hotelMediasRepository: Repository<HotelMedia>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly categoriesService: CategoriesService,
        private readonly citiesService: CitiesService,
        private readonly facilitiesService: FacilitiesService,
        private readonly filesService: FilesService,
    ) {}

    async create(payload: CreateHotelDto): Promise<Hotel> {
        const category = await this.categoriesService.findOne({ id: payload.categoryId });
        const city = await this.citiesService.findOne({ id: payload.cityId });
        const hotel = await this.hotelsRepository.save(
            this.hotelsRepository.create({
                ...payload,
                category: category,
                city: city,
            }),
        );
        this.addFacilities(hotel.id, payload.facilityIds);
        this.logger.log(`hotel ${hotel.name} created successfully`);
        return await this.findById(hotel.id);
    }

    async findAllBy(pageOptionsDto: PageOptionsDto, searchDto: SearchHotelDto): Promise<PageDto<Hotel>> {
        const queryBuilder = this.hotelsRepository.createQueryBuilder('hotel');
        queryBuilder
            .select([
                'hotel.id',
                'hotel.code',
                'hotel.name',
                'hotel.description',
                'hotel.address',
                'hotel.latitude',
                'hotel.longitude',
                'hotel.geohash',
                'hotel.isActive',
                'city.name',
            ])
            .leftJoin('hotel.city', 'city');

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }

        if (searchDto.code) {
            queryBuilder.andWhere('hotel.code =:code', { code: searchDto.code });
        }
        if (searchDto.name) {
            queryBuilder.andWhere('LOWER(hotel.name) like :name', { name: `%${searchDto.name.toLowerCase()}%` });
        }
        if (searchDto.address) {
            queryBuilder.andWhere('LOWER(hotel.address) like :address', {
                address: `%${searchDto.address.toLowerCase()}%`,
            });
        }
        if (searchDto.category) {
            queryBuilder.andWhere('hotel.category = :category', { category: searchDto.category });
        }

        if (searchDto.cityId > 0) {
            queryBuilder.andWhere('city.id =:cityId', { cityId: searchDto.cityId });
        }

        queryBuilder.orderBy('hotel.name', pageOptionsDto.order).skip(pageOptionsDto.skip).take(pageOptionsDto.take);

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

    async findOne(fields: EntityCondition<Hotel>): Promise<NullableType<Hotel>> {
        const data = await this.hotelsRepository.findOne({
            where: fields,
            relations: {
                city: true,
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

    async findById(id: number): Promise<NullableType<Hotel>> {
        const queryBuilder = this.hotelsRepository.createQueryBuilder('hotel');
        const data = await queryBuilder
            .select([
                'hotel.id',
                'hotel.code',
                'hotel.name',
                'hotel.description',
                'hotel.address',
                'hotel.latitude',
                'hotel.longitude',
                'hotel.geohash',
                'hotel.isActive',
                'city.name',
                // 'facilities.name',
                // 'facilities.icon'
            ])
            .leftJoin('hotel.city', 'city')
            // .leftJoin('hotel.facilities', 'facilities')
            .where('hotel.id =:id', { id: id })
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

    async findDetailById(id: number): Promise<any> {
        const queryBuilder = this.hotelsRepository.createQueryBuilder('hotel');
        const data = await queryBuilder
            .select([
                'hotel.id',
                'hotel.code',
                'hotel.name',
                'hotel.description',
                'hotel.address',
                'hotel.latitude',
                'hotel.longitude',
                'hotel.geohash',
                'hotel.isActive',
                'medias.url',
                'city.name',
            ])
            .leftJoin('hotel.medias', 'medias')
            .leftJoinAndSelect('hotel.facilities', 'facilities')
            .leftJoin('hotel.city', 'city')
            .where('hotel.id =:id', { id: id })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }

        const hotelImages = await Promise.all(
            data.medias
                ? data.medias.map(async (m: HotelMedia) => await this.filesService.getFileLinkByUrl(m.url))
                : [],
        );

        return {
            hotelId: data.id,
            hotelName: data.name,
            hotelDescription: data.description,
            hotelAddress: data.address,
            hotelLat: data.latitude,
            hotelLong: data.longitude,
            hotelGeoHash: data.geohash,
            hotelIsActive: data.isActive,
            hotelImages: hotelImages,
            hotelFacilities: data.facilities,
            hotelCity: data.city.name,
        };
    }

    async findWithFacilitiesById(id: number): Promise<NullableType<Hotel>> {
        const queryBuilder = this.hotelsRepository.createQueryBuilder('hotel');
        const data = await queryBuilder
            .select([
                'hotel.id',
                'hotel.code',
                'hotel.name',
                'hotel.description',
                'hotel.address',
                'hotel.latitude',
                'hotel.longitude',
                'hotel.geohash',
                'hotel.isActive',
                'city.name',
                'facilities.name',
                'facilities.icon',
            ])
            .leftJoin('hotel.city', 'city')
            .leftJoin('hotel.facilities', 'facilities')
            .where('hotel.id =:id', { id: id })
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

    async update(hotelId: number, payload: UpdateHotelDto): Promise<Hotel> {
        try {
            let city = null;
            if (payload.cityId > 0) {
                city = await this.citiesService.findOne({ id: payload.cityId });
            }
            const hotel = await this.hotelsRepository.preload({
                id: hotelId,
                ...payload,
                city: city,
            });
            if (!hotel) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${hotelId}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.hotelsRepository.save(hotel);
            await this.updateFacilities(hotelId, payload.facilityIds);
            this.logger.log(`hotel ${hotel.name} updated successfully`);
            return await this.findById(hotel.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async updateStatus(hotelId: number, isActive: number): Promise<Hotel> {
        try {
            const hotel = await this.findOne({ id: hotelId });
            hotel.isActive = isActive;
            await hotel.save();
            return await this.findById(hotel.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async delete(hotelId: number): Promise<number> {
        const deleteResponse = await this.hotelsRepository.delete(hotelId);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${hotelId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`hotel deleted successfully`);
        return 1;
    }

    async addFacilities(hotelId: number, facilityIds: number[]): Promise<void> {
        if (Array.isArray(facilityIds) && facilityIds.length > 0) {
            const hotel = await this.findOne({ id: hotelId });
            for (const facilityId of facilityIds) {
                const facility = await this.facilitiesService.findOne({ id: facilityId });
                const createHotelFacility = { name: facility.name, icon: facility.icon, hotel: hotel };
                await this.hotelFacilitiesRepository.save(this.hotelFacilitiesRepository.create(createHotelFacility));
                this.logger.log(`hotel ${hotel.name} facilities created successfully`);
            }
        }
    }

    async updateFacilities(hotelId: number, facilityIds: number[]): Promise<void> {
        if (Array.isArray(facilityIds) && facilityIds.length > 0) {
            const hotel = await this.findOne({ id: hotelId });
            for (const facilityId of facilityIds) {
                const facility = await this.facilitiesService.findOne({ id: facilityId });
                const hotelFacility = await this.hotelFacilitiesRepository.findOne({ where: { icon: facility.icon } });
                if (!hotelFacility) {
                    const createHotelFacility = { name: facility.name, icon: facility.icon, hotel: hotel };
                    await this.hotelFacilitiesRepository.save(
                        this.hotelFacilitiesRepository.create(createHotelFacility),
                    );
                }
            }
            this.logger.log(`hotel ${hotel.name} facilities updated successfully`);
        }
    }

    async deleteFacilities(hotelId: number): Promise<void> {
        const queryBuilder = this.hotelFacilitiesRepository.createQueryBuilder('hotelFacilities');
        await queryBuilder.delete().from(HotelFacilities).where('hotel_id = :hotelId', { hotelId: hotelId }).execute();
        this.logger.log(`hotel facilities deleted successfully`);
    }

    async findFacilitiesByHotelId(hotelId: number): Promise<HotelFacilities[]> {
        return await this.hotelFacilitiesRepository.find({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            where: { hotel: { id: hotelId } },
        });
    }

    async findFacilityById(id: number): Promise<HotelFacilities[]> {
        return await this.hotelFacilitiesRepository.find({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            where: { id: id },
        });
    }

    async uploadMedia(fileGroup: string, payload: ImageFileDTO, hotelId: number): Promise<HotelMedia> {
        const hotel = await this.findOne({ id: hotelId });
        const filePath = `assets/${fileGroup}/${generateUUID()}-${payload.originalname}`;

        await this.filesService.uploadToS3(payload.buffer, filePath, payload.mimetype);
        const fileUrl = await this.filesService.createFileLink(filePath);

        const fileStored = await this.hotelMediasRepository.save(
            this.hotelMediasRepository.create({
                name: payload.originalname,
                url: fileUrl,
                key: filePath,
                type: payload.mimetype,
                hotel: hotel,
            }),
        );

        return fileStored;
    }

    async findMediasByHotelId(hotelId: number) {
        const files = await this.hotelMediasRepository.find({ where: { hotel: { id: hotelId } }, cache: true });
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

    async findMediaById(fileId: number, hotelId: number) {
        let fileInfo = null;
        if (hotelId !== 0) {
            fileInfo = await this.hotelMediasRepository.findOne({ where: { id: fileId, hotel: { id: hotelId } } });
        } else {
            fileInfo = await this.hotelMediasRepository.findOne({ where: { id: fileId } });
        }
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

    async deleteFile(fileId: number, hotelId: number): Promise<number> {
        let file = null;
        if (hotelId !== 0) {
            file = await this.hotelMediasRepository.findOne({
                where: { id: fileId, hotel: { id: hotelId } },
            });
        } else {
            file = await this.hotelMediasRepository.findOne({
                where: { id: fileId },
            });
        }
        if (!file) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} media data with parameter {${fileId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        const deleteResult = await this.filesService.deleteFromS3(file.key);
        if (deleteResult > 0) {
            const deleteResponse = await this.hotelMediasRepository.delete(fileId);
            if (!deleteResponse.affected) {
                return 0;
            }
            return 1;
        }
        return 0;
    }

    async findCurrencyById(hotelId: number): Promise<any> {
        const queryBuilder = this.hotelsRepository.createQueryBuilder('hotel');
        const data = await queryBuilder
            .select([
                'currency.id',
                'currency.code',
                'currency.symbol',
                'currency.description',
                'currency.decimal_place',
                'currency.is_default',
            ])
            .leftJoin('hotel.city', 'city')
            .leftJoin('city.country', 'country')
            .leftJoin('country.currency', 'currency')
            .where('hotel.id = :hotelId', { hotelId: hotelId })
            .getRawOne();
        return data;
    }
}
