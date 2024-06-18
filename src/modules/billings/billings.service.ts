import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Billing } from './entities/billing.entity';
import { CreateBillingReqDto } from './dto/create-billing.dto';
import { HotelsService } from '@modules/hotels/hotels.service';
import { GuestsService } from '@modules/guests/guests.service';
import { DateTime } from 'luxon';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import { BillingStatus, StripePaymentIntentStatus } from '@common/enums/status.enum';
import { StripeService } from '@modules/stripe/stripe.service';
import { RoomTypesService } from '@modules/roomtypes/roomtypes.service';
import AppError from '@common/errors/app.error';
import BookingError from '@common/errors/booking.error';

@Injectable()
export class BillingsService {
    private readonly className: string = 'billing';
    constructor(
        @InjectRepository(Billing) private readonly billingsRepository: Repository<Billing>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly hotelsService: HotelsService,
        private readonly roomTypeService: RoomTypesService,
        private readonly guestsService: GuestsService,
        private readonly stripeService: StripeService,
    ) {}

    async create(payload: CreateBillingReqDto): Promise<void> {
        const hotel = await this.hotelsService.findById(payload.hotelId);
        const roomType = await this.roomTypeService.findById(payload.roomTypeId);
        const guest = await this.guestsService.findById(payload.guestId);

        await this.billingsRepository.save(
            this.billingsRepository.create({
                bookingCode: payload.bookingCode,
                startDate: payload.startDate,
                endDate: payload.endDate,
                roomCount: payload.roomCount,
                totalPrice: payload.totalPrice,
                hotel: hotel,
                roomType: roomType,
                guest: guest,
                paymentId: payload.paymentId,
                status: payload.status,
            }),
        );
    }

    async findOne(fields: EntityCondition<Billing>): Promise<NullableType<Billing>> {
        const data = await this.billingsRepository.findOne({
            where: fields,
            relations: {
                hotel: true,
                roomType: true,
                guest: true,
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

    setBillingStatus(stripePaymentStatus: string): string {
        if (stripePaymentStatus === StripePaymentIntentStatus.SUCCEEDED) {
            return BillingStatus.COMPLETED;
        } else if (stripePaymentStatus === StripePaymentIntentStatus.CANCELED) {
            return BillingStatus.CANCELED;
        } else {
            return BillingStatus.PENDING; // pending or unpaid
        }
    }

    async updateStatus(
        bookingCode: string,
        paymentId: string,
        billingStatus: string,
        paymentDate: number,
    ): Promise<Billing> {
        try {
            const billing = await this.findOne({
                bookingCode: bookingCode,
                paymentId: paymentId, // comment this line for testing purpose
            });
            if (!billing) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with criteria cannot be found`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }

            const paymentAt =
                billingStatus === BillingStatus.COMPLETED ? DateTime.fromSeconds(paymentDate).toJSDate() : null;
            switch (billing.status) {
                case BillingStatus.UNPAID:
                    billing.status = billingStatus;
                    billing.paymentDate = paymentAt;
                    break;
                case BillingStatus.FAILED:
                    billingStatus = BillingStatus.REFUNDED;
                    billing.status = billingStatus;
                    billing.deletedAt = new Date();
                    await this.stripeService.cancelPayment(billing.paymentId); // cancel the PaymentIntent
                    break;
                default:
                    throw new BookingError(
                        HttpStatus.NOT_FOUND,
                        `The billing status is invalid`,
                        BookingError.errors.INVALID_BILLING_STATUS,
                    );
            }
            return await billing.save();
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async updatePendingPayment(): Promise<string> {
        const paymentExpiresIn = this.configService.getOrThrow('stripe.paymentExpires');
        const currentDate = DateTime.now();
        const last5MinutesDate = currentDate.minus({ seconds: paymentExpiresIn });
        const acceptableStatus: Array<string> = [BillingStatus.UNPAID, BillingStatus.PENDING];

        const queryBuilder = this.billingsRepository.createQueryBuilder('billing');
        const result = await queryBuilder
            .update(Billing)
            .set({ status: BillingStatus.FAILED })
            .where({ status: In([...acceptableStatus]) })
            .andWhere('createdAt < :expires', { expires: last5MinutesDate })
            .returning(['id', 'paymentId'])
            .execute();

        if (result.affected > 0) {
            // Cancel the payment intent from stripe
            const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

            (async () => {
                for (let i = 0; i < result.affected; i++) {
                    this.logger.debug('billing paymentId', result.raw[i]['payment_id']);
                    const cancelPayment = await this.stripeService.cancelPayment(result.raw[i]['payment_id']);
                    this.logger.debug('cancel payment ID', cancelPayment.id);
                    await sleep(2000);
                }
                this.logger.debug(`PaymentIntents cancellation is done at ${new Date()}`);
            })();
        }
        return BillingStatus.FAILED;
    }
}
