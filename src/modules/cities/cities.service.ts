import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CountriesService } from '@modules/countries/countries.service';
import { SearchCityDto } from './dto/search-city.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import AppError from '@common/errors/app.error';

@Injectable()
export class CitiesService {
    private readonly className: string = 'city';
    constructor(
        @InjectRepository(City) private readonly citiesRepository: Repository<City>,
        private readonly logger: Logger,
        private readonly countriesService: CountriesService,
    ) {}

    async create(payload: CreateCityDto): Promise<City> {
        const country = await this.countriesService.findOne({ id: payload.countryId });
        const city = await this.citiesRepository.save(
            this.citiesRepository.create({
                ...payload,
                country: country,
            }),
        );
        this.logger.log(`city ${city.name} created successfully`);
        return await this.findById(city.id);
    }

    async findAll(): Promise<City[]> {
        return await this.citiesRepository.find();
    }

    async paginate(pageOptionsDto: PageOptionsDto, searchDto?: SearchCityDto): Promise<PageDto<City>> {
        const queryBuilder = this.citiesRepository.createQueryBuilder('city');

        if (searchDto) {
            // search by filter and pagination params
            queryBuilder
                .leftJoinAndSelect('city.country', 'country')
                .select(['city.id', 'city.name', 'city.latitude', 'city.longitude', 'country.code'])
                .where('LOWER(city.name) like :name', { name: `%${searchDto.name.toLowerCase()}%` })
                .orderBy('city.name', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        } else {
            // search by pagination params only
            queryBuilder
                .leftJoinAndSelect('city.country', 'country')
                .select(['city.id', 'city.name', 'city.latitude', 'city.longitude', 'country.code'])
                .orderBy('city.name', pageOptionsDto.order)
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

    async findOne(fields: EntityCondition<City>): Promise<NullableType<City>> {
        const data = await this.citiesRepository.findOne({
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

    async findById(id: number): Promise<NullableType<City>> {
        const queryBuilder = this.citiesRepository.createQueryBuilder('city');
        const data = await queryBuilder
            .leftJoinAndSelect('city.country', 'country')
            .select(['city.id', 'city.name', 'city.latitude', 'city.longitude', 'country.code'])
            .where('city.id =:id', { id: id })
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

    async getCurrencyByCityId(cityId: number): Promise<City> {
        const queryBuilder = this.citiesRepository.createQueryBuilder('city');
        const data = await queryBuilder
            .leftJoinAndSelect('city.country', 'country')
            .leftJoinAndSelect('country.currency', 'currency')
            .select(['city.id', 'city.name', 'city.latitude', 'city.longitude'])
            .where('city.id =:id', { id: cityId })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} currency data with parameter {${cityId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async update(id: number, payload: UpdateCityDto): Promise<City> {
        try {
            let country = null;
            if (payload.countryId > 0) {
                country = await this.countriesService.findOne({ id: payload.countryId });
            }
            const city = await this.citiesRepository.preload({
                id: id,
                ...payload,
                country: country,
            });
            if (!city) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.citiesRepository.save(city);
            this.logger.log(`city ${city.name} updated successfully`);
            return await this.findById(city.id);
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
        const deleteResponse = await this.citiesRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`city deleted successfully`);
        return 1;
    }
}
