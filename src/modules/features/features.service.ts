import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { SearchFeatureDto } from './dto/search-feature.dto';
import { PageDto } from '@common/dto/page.dto';
import { NullableType } from '@common/types/nullable.type';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import AppError from '@common/errors/app.error';

@Injectable()
export class FeaturesService {
    private readonly className: string = 'feature';
    constructor(
        @InjectRepository(Feature) private readonly featuresRepository: Repository<Feature>,
        private readonly logger: Logger,
    ) {}

    async create(payload: CreateFeatureDto): Promise<Feature> {
        const feature = await this.featuresRepository.save(
            this.featuresRepository.create({
                ...payload,
            }),
        );
        this.logger.log(`feature ${feature.name} created successfully`);
        return await this.findById(feature.id);
    }

    async findAll(): Promise<Feature[]> {
        return await this.featuresRepository.find();
    }

    async paginate(
        pageOptionsDto: PageOptionsDto,
        searchDto?: SearchFeatureDto,
    ): Promise<PageDto<NullableType<Feature>>> {
        const queryBuilder = this.featuresRepository.createQueryBuilder('feature');

        if (searchDto) {
            // search by filter and pagination params
            queryBuilder
                .select(['feature.id', 'feature.name', 'feature.icon'])
                .where('feature.name like :name', { name: `%${searchDto.name}%` })
                .orWhere('feature.icon like :icon', { icon: `%${searchDto.icon}%` })
                .orderBy('feature.name', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        } else {
            // search by pagination params only
            queryBuilder
                .select(['feature.id', 'feature.name', 'feature.icon'])
                .orderBy('feature.name', pageOptionsDto.order)
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

    async findOne(fields: EntityCondition<Feature>): Promise<NullableType<Feature>> {
        const data = await this.featuresRepository.findOne({
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

    async findById(id: number): Promise<NullableType<Feature>> {
        const queryBuilder = this.featuresRepository.createQueryBuilder('feature');
        const data = await queryBuilder
            .select(['feature.id', 'feature.name', 'feature.icon'])
            .where('feature.id =:id', { id: id })
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

    async update(id: number, payload: UpdateFeatureDto): Promise<Feature> {
        try {
            const feature = await this.featuresRepository.preload({
                id: id,
                ...payload,
            });
            if (!feature) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.featuresRepository.save(feature);
            this.logger.log(`feature ${feature.name} updated successfully`);
            return await this.findById(feature.id);
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
        const deleteResponse = await this.featuresRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`feature deleted successfully`);
        return 1;
    }
}
