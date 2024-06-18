import { Logger, Module } from '@nestjs/common';
import { BillingsService } from './billings.service';
import { Billing } from './entities/billing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { RoomTypesModule } from '@modules/roomtypes/roomtypes.module';
import { GuestsModule } from '@modules/guests/guests.module';
import { StripeModule } from '@modules/stripe/stripe.module';

@Module({
    imports: [TypeOrmModule.forFeature([Billing]), HotelsModule, RoomTypesModule, GuestsModule, StripeModule],
    controllers: [],
    providers: [Logger, BillingsService],
    exports: [BillingsService],
})
export class BillingsModule {}
