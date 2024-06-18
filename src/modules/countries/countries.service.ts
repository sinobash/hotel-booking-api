import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CurrenciesService } from '@modules/currencies/currencies.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { SearchCountryDto } from './dto/search-country.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { NullableType } from '@common/types/nullable.type';
import { EntityCondition } from '@common/types/entity-condition.type';
import AppError from '@common/errors/app.error';

@Injectable()
export class CountriesService {
    private readonly className: string = 'country';
    constructor(
        @InjectRepository(Country) private readonly countriesRepository: Repository<Country>,
        private readonly logger: Logger,
        private readonly currenciesService: CurrenciesService,
    ) {}

    async create(payload: CreateCountryDto): Promise<Country> {
        const currency = await this.currenciesService.findOne({ id: payload.currencyId });
        const country = await this.countriesRepository.save(
            this.countriesRepository.create({
                ...payload,
                currency: currency,
            }),
        );
        this.logger.log(`country ${country.code} created successfully`);
        return await this.findById(country.id);
    }

    async findAll(): Promise<Country[]> {
        return await this.countriesRepository.find();
    }

    async paginate(
        pageOptionsDto: PageOptionsDto,
        searchDto?: SearchCountryDto,
    ): Promise<PageDto<NullableType<Country>>> {
        const queryBuilder = this.countriesRepository.createQueryBuilder('country');

        if (searchDto) {
            // search by filter and pagination params
            queryBuilder
                .innerJoinAndSelect('country.currency', 'currency')
                .select([
                    'country.id',
                    'country.code',
                    'country.name',
                    'country.phoneCode',
                    'country.latitude',
                    'country.longitude',
                    'currency.code',
                ])
                .where('country.code =:code', { code: searchDto.code })
                .orWhere('country.name like :name', { name: `%${searchDto.name}%` })
                // .andWhere('name =:name', {name: searchDto.name})
                .orderBy('country.name', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        } else {
            // search by pagination params only
            queryBuilder
                .innerJoinAndSelect('country.currency', 'currency')
                .select([
                    'country.id',
                    'country.code',
                    'country.name',
                    'country.phoneCode',
                    'country.latitude',
                    'country.longitude',
                    'currency.code',
                ])
                .orderBy('country.name', pageOptionsDto.order)
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

    async findOne(fields: EntityCondition<Country>): Promise<NullableType<Country>> {
        const data = await this.countriesRepository.findOne({
            where: fields,
            relations: {
                currency: true,
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

    async findById(id: number): Promise<NullableType<Country>> {
        const queryBuilder = this.countriesRepository.createQueryBuilder('country');
        const data = await queryBuilder
            .innerJoinAndSelect('country.currency', 'currency')
            .select([
                'country.id',
                'country.code',
                'country.name',
                'country.phoneCode',
                'country.latitude',
                'country.longitude',
                'currency.code',
            ])
            .where('country.id =:id', { id: id })
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

    async update(id: number, payload: UpdateCountryDto): Promise<Country> {
        try {
            let currency = null;
            if (payload.currencyId > 0) {
                currency = await this.currenciesService.findOne({ id: payload.currencyId });
            }
            const country = await this.countriesRepository.preload({
                id: id,
                ...payload,
                currency: currency,
            });
            if (!country) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            this.logger.log(`country ${country.name} updated successfully`);
            await this.countriesRepository.save(country);
            return await this.findById(country.id);
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
        const deleteResponse = await this.countriesRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`country deleted successfully`);
        return 1;
    }
}
