import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { SearchFacilityDto } from './dto/search-facility.dto';
import { PageDto } from '@common/dto/page.dto';
import { NullableType } from '@common/types/nullable.type';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import AppError from '@common/errors/app.error';

@Injectable()
export class FacilitiesService {
    private readonly className: string = 'facility';
    constructor(
        @InjectRepository(Facility) private readonly facilitiesRepository: Repository<Facility>,
        private readonly logger: Logger,
    ) {}

    async create(payload: CreateFacilityDto): Promise<Facility> {
        const facility = await this.facilitiesRepository.save(
            this.facilitiesRepository.create({
                ...payload,
            }),
        );
        this.logger.log(`facility ${facility.name} created successfully`);
        return await this.findById(facility.id);
    }

    async findAll(): Promise<Facility[]> {
        return await this.facilitiesRepository.find();
    }

    async paginate(
        pageOptionsDto: PageOptionsDto,
        searchDto?: SearchFacilityDto,
    ): Promise<PageDto<NullableType<Facility>>> {
        const queryBuilder = this.facilitiesRepository.createQueryBuilder('facility');

        if (searchDto) {
            // search by filter and pagination params
            queryBuilder
                .select(['facility.id', 'facility.name', 'facility.icon'])
                .where('facility.name like :name', { name: `%${searchDto.name}%` })
                .orWhere('facility.icon like :icon', { icon: `%${searchDto.icon}%` })
                .orderBy('facility.name', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        } else {
            // search by pagination params only
            queryBuilder
                .select(['facility.id', 'facility.name', 'facility.icon'])
                .orderBy('facility.name', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        }

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

    async findOne(fields: EntityCondition<Facility>): Promise<NullableType<Facility>> {
        const data = await this.facilitiesRepository.findOne({
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

    async findById(id: number): Promise<NullableType<Facility>> {
        const queryBuilder = this.facilitiesRepository.createQueryBuilder('facility');
        const data = await queryBuilder
            .select(['facility.id', 'facility.name', 'facility.icon'])
            .where('facility.id =:id', { id: id })
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

    async update(id: number, payload: UpdateFacilityDto): Promise<Facility> {
        try {
            const facility = await this.facilitiesRepository.preload({
                id: id,
                ...payload,
            });
            if (!facility) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.facilitiesRepository.save(facility);
            this.logger.log(`facility ${facility.name} updated successfully`);
            return await this.findById(facility.id);
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
        const deleteResponse = await this.facilitiesRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`facility deleted successfully`);
        return 1;
    }
}
