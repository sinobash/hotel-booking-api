import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import StripeEvent from './entities/stripe-event.entity';
import { BookingsService } from '@modules/bookings/bookings.service';
import { BillingsService } from '@modules/billings/billings.service';
import Stripe from 'stripe';
import { DateTime } from 'luxon';
import { BillingStatus } from '@common/enums/status.enum';
import { CreateBillingReqDto } from '@modules/billings/dto/create-billing.dto';
import AppError from '@common/errors/app.error';

@Injectable()
export class StripeWebhookService {
    constructor(
        @InjectRepository(StripeEvent) private stripeEventsRepository: Repository<StripeEvent>,
        private readonly bookingsService: BookingsService,
        private readonly billingsService: BillingsService,
    ) {}

    async createEvent(event: Stripe.Event, bookingCode: string): Promise<StripeEvent> {
        const id = String(event.id);
        const data = event.data.object as Stripe.PaymentIntent;
        const paymentId = String(data.id);
        const amount = Number(data.amount);
        const amountCapturable = Number(data.amount_capturable);
        const amountReceived = Number(data.amount_received);
        const created = DateTime.fromSeconds(data.created);
        const currency = String(data.currency);
        const metadata = data.metadata;
        const latestCharge = String(data.latest_charge);
        const paymentMethod = String(data.payment_method);
        const paymentMethodOptions = data.payment_method_options;
        const paymentMethodTypes = data.payment_method_types;
        const status = data.status;
        const canceledAt = data.canceled_at !== null ? DateTime.fromSeconds(data.canceled_at) : null;

        const events = await this.stripeEventsRepository.save(
            this.stripeEventsRepository.create({
                id: id,
                paymentId: paymentId,
                bookingCode: bookingCode,
                amount: amount,
                amountCapturable: amountCapturable,
                amountReceived: amountReceived,
                created: created,
                currency: currency,
                metadata: metadata,
                latestCharge: latestCharge,
                paymentMethod: paymentMethod,
                paymentMethodOptions: paymentMethodOptions,
                paymentMethodTypes: paymentMethodTypes,
                status: status,
                canceledAt: canceledAt,
            }),
        );
        return events;
    }

    async handleStripeEvent(event: Stripe.Event) {
        const data = event.data.object as Stripe.PaymentIntent;
        const metadata = data.metadata;

        const bookingCode: string = metadata.booking_code;
        const paymentId: string = data.id;
        const paymentDate: number = data.created;
        let events: StripeEvent;
        try {
            events = await this.createEvent(event, bookingCode);
        } catch (error) {
            if (error?.code === 23505) {
                throw new AppError(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    `This event was already processed`,
                    AppError.errors.DUPLICATE_ERROR,
                );
            }
        }

        let billingStatus;
        switch (event.type) {
            case 'payment_intent.succeeded':
                billingStatus = BillingStatus.COMPLETED;
                break;
            case 'payment_intent.processing':
                billingStatus = BillingStatus.PENDING;
                break;
            case 'payment_intent.payment_failed':
                billingStatus = BillingStatus.FAILED;
                break;
            default:
                console.log(`Unhandled event type ${event.type}.`);
                break;
        }

        const billing = await this.billingsService.updateStatus(bookingCode, paymentId, billingStatus, paymentDate);
        let booking;
        if (billingStatus === BillingStatus.COMPLETED) {
            const bookingStatus = this.bookingsService.setBookingStatus(billing.status);
            const payloadFromBilling: CreateBillingReqDto = {
                bookingCode: billing.bookingCode,
                startDate: billing.startDate.toISOString(),
                endDate: billing.endDate.toISOString(),
                roomCount: billing.roomCount,
                totalPrice: billing.totalPrice,
                hotelId: billing.hotel.id,
                roomTypeId: billing.roomType.id,
                guestId: billing.guest.id,
                paymentId: billing.paymentId,
                status: bookingStatus,
            };
            booking = await this.bookingsService.createBooking(payloadFromBilling);
            await this.bookingsService.sendEmailAfterBooking(booking, events.currency);
        }
    }
}
