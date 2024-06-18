import StripeEvent from '@modules/webhooks/entities/stripe-event.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import AppError from '@common/errors/app.error';

@Injectable()
export class StripeService {
    private readonly className: string = 'stripe-logs';
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        private readonly logger: Logger,
        @InjectRepository(StripeEvent) private stripeEventsRepository: Repository<StripeEvent>,
    ) {
        this.stripe = new Stripe(configService.get<string>('stripe.secretAccessKey'), {
            apiVersion: configService.get('stripe.apiVersion'),
        });
    }

    async createCustomer(name: string, email: string) {
        try {
            return await this.stripe.customers.create({
                name,
                email,
            });
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async createPayment(bookingCode: string, amount: number, currency?: string) {
        try {
            return await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // stripe require integer data type for amount
                currency: currency || this.configService.get<string>('stripe.defaultCurrency'),
                automatic_payment_methods: { enabled: true, allow_redirects: 'always' },
                metadata: {
                    booking_code: bookingCode,
                },
                // confirm: true,
                description: 'Booking Hotel #'.concat(bookingCode),
            });
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async retrievePayment(paymentId: string) {
        try {
            const intent = await this.stripe.paymentIntents.retrieve(paymentId, {
                expand: ['payment_method'],
            });
            return intent;
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async cancelPayment(paymentId: string) {
        try {
            return await this.stripe.paymentIntents.cancel(paymentId);
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async charge(amount: number, paymentMethodId: string, currency?: string) {
        try {
            return await this.stripe.paymentIntents.create({
                amount: amount * 100, // convert amount to cent
                payment_method: paymentMethodId,
                currency: currency || this.configService.get<string>('stripe.defaultCurrency'),
                confirm: true,
            });
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async chargeWithCustomer(amount: number, paymentMethodId: string, customerId: string, currency?: string) {
        try {
            return await this.stripe.paymentIntents.create({
                amount,
                customer: customerId,
                payment_method: paymentMethodId,
                currency: currency || this.configService.get<string>('stripe.defaultCurrency'),
                confirm: true,
            });
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async constructEventFromPayload(signature: string, payload: Buffer) {
        try {
            const webhookSecret = this.configService.get<string>('stripe.webHookSecretkey');
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async findAllStoredEvents(pageOptionsDto: PageOptionsDto): Promise<PageDto<StripeEvent>> {
        const queryBuilder = this.stripeEventsRepository.createQueryBuilder('events');
        queryBuilder
            .select(['events.id', 'events.createdAt'])
            .orderBy('events.createdAt', pageOptionsDto.order)
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

    async retrieveEvent(eventId: string) {
        try {
            const event = await this.stripe.events.retrieve(eventId);
            return event;
        } catch (error) {
            this.logger.error(`An unknown stripe exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown stripe exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async findAllPayments(pageOptionsDto: PageOptionsDto): Promise<PageDto<any>> {
        const queryBuilder = this.stripeEventsRepository.createQueryBuilder('events');
        queryBuilder
            .select(['events.id', 'events.createdAt'])
            .orderBy('events.createdAt', pageOptionsDto.order)
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take);
        const total = await queryBuilder.getCount();
        const { entities } = await queryBuilder.getRawAndEntities();

        const paymentPromise = entities.map(async (entity) => {
            const event = await this.retrieveEvent(entity.id);
            const data = event.data.object as Stripe.PaymentIntent;
            if (data.object === 'payment_intent') {
                const payment = await this.retrievePayment(data.id);
                return payment;
            }
            // return data;
        });
        const payments = await Promise.all(paymentPromise);

        const pageMetaDto = new PageMetaDto({ pageOptionsDto, total });

        const pageCount = pageMetaDto.pageCount;

        if (pageCount >= pageMetaDto.page) {
            // return new PageDto(entities, pageMetaDto);
            return new PageDto(payments, pageMetaDto);
        } else {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
    }
}
