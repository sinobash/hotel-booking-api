import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import AppError from '@common/errors/app.error';

@Injectable()
export class CurrenciesService {
    private readonly className: string = 'currency';
    constructor(
        @InjectRepository(Currency) private readonly currenciesRepository: Repository<Currency>,
        private readonly logger: Logger,
    ) {}

    async create(payload: CreateCurrencyDto): Promise<Currency> {
        const currency = await this.currenciesRepository.save(
            this.currenciesRepository.create({
                ...payload,
            }),
        );
        this.logger.log(`currency ${currency.code} created successfully`);
        return await this.findById(currency.id);
    }

    async findAll(): Promise<Currency[]> {
        return await this.currenciesRepository.find();
    }

    async findBy(fields: EntityCondition<Currency>): Promise<Currency[]> {
        return await this.currenciesRepository.find({
            where: fields,
        });
    }

    async findOne(fields: EntityCondition<Currency>): Promise<NullableType<Currency>> {
        const data = await this.currenciesRepository.findOne({
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

    async findById(id: number): Promise<NullableType<Currency>> {
        const queryBuilder = this.currenciesRepository.createQueryBuilder('currency');
        const data = await queryBuilder
            .select([
                'currency.id',
                'currency.code',
                'currency.symbol',
                'currency.description',
                'currency.decimalPlace',
                'currency.isDefault',
            ])
            .where('currency.id =:id', { id: id })
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

    async update(id: number, payload: UpdateCurrencyDto): Promise<Currency> {
        try {
            const currency = await this.currenciesRepository.preload({
                id: id,
                ...payload,
            });
            if (!currency) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.currenciesRepository.save(currency);
            this.logger.log(`currency ${currency.code} updated successfully`);
            return await this.findById(currency.id);
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
        const deleteResponse = await this.currenciesRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`currency deleted successfully`);
        return 1;
    }
}
