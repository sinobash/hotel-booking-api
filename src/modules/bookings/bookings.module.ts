import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookedRoom } from './entities/booked-room.entity';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { RoomTypesModule } from '@modules/roomtypes/roomtypes.module';
import { RoomsModule } from '@modules/rooms/rooms.module';
import { GuestsModule } from '@modules/guests/guests.module';
import { BillingsModule } from '@modules/billings/billings.module';
import { StripeModule } from '@modules/stripe/stripe.module';
import { BookingsService } from './bookings.service';
import { AdminBookingsController } from './admin-bookings.controller';
import { BookingsController } from './bookings.controller';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@modules/redis/redis.module';
import { MailModule } from '@modules/mail/mail.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, BookedRoom]),
        RolesModule,
        HotelsModule,
        RoomTypesModule,
        RoomsModule,
        GuestsModule,
        BillingsModule,
        StripeModule,
        JwtModule.register({}),
        RedisModule,
        MailModule,
        NotificationsModule,
    ],
    controllers: [AdminBookingsController, BookingsController],
    providers: [Logger, BookingsService],
    exports: [BookingsService],
})
export class BookingsModule {}
