import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import StripeEvent from '@modules/webhooks/entities/stripe-event.entity';
import { StripeService } from './stripe.service';

@Module({
    imports: [TypeOrmModule.forFeature([StripeEvent])],
    providers: [Logger, StripeService],
    exports: [StripeService],
})
export class StripeModule {}
