import { Module } from '@nestjs/common';
import StripeEvent from './entities/stripe-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeModule } from '@modules/stripe/stripe.module';
import { BookingsModule } from '@modules/bookings/bookings.module';
import { BillingsModule } from '@modules/billings/billings.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { WebhooksController } from './webhooks.controller';

@Module({
    imports: [TypeOrmModule.forFeature([StripeEvent]), StripeModule, BookingsModule, BillingsModule],
    providers: [StripeWebhookService],
    controllers: [WebhooksController],
    exports: [StripeWebhookService],
})
export class WebhooksModule {}
