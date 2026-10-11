import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from '@infrastructure/config/app.config';
import logConfig from '@infrastructure/config/log.config';
import databaseConfig from '@infrastructure/config/database.config';
import jwtConfig from '@infrastructure/config/jwt.config';
import mailConfig from '@infrastructure/config/mail.config';
import redisConfig from '@infrastructure/config/redis.config';
import fileConfig from '@infrastructure/config/file.config';
import stripeConfig from '@infrastructure/config/stripe.config';
import twilioConfig from '@infrastructure/config/twilio.config';
import socketioConfig from '@infrastructure/config/socketio.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@infrastructure/database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { IsExist } from '@common/validators/is-exists.validator';
import { IsNotExist } from '@common/validators/is-not-exists.validator';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { ReponseTransformInterceptor } from '@common/interceptors/reponse-transform.interceptor';
import { AuthModule } from '@modules/auth/auth.module';
import { AdminModule } from '@modules/admin/admin.module';
import { RolesModule } from '@modules/roles/roles.module';
import { UsersModule } from '@modules/users/users.module';
import { FilesModule } from '@modules/files/files.module';
import { CurrenciesModule } from '@modules/currencies/currencies.module';
import { CountriesModule } from '@modules/countries/countries.module';
import { CitiesModule } from '@modules/cities/cities.module';
import { FacilitiesModule } from '@modules/facilities/facilities.module';
import { FeaturesModule } from '@modules/features/features.module';
import { HotelsModule } from '@modules/hotels/hotels.module';
import { RoomTypesModule } from '@modules/roomtypes/roomtypes.module';
import { RoomsModule } from '@modules/rooms/rooms.module';
import { GuestsModule } from '@modules/guests/guests.module';
import { RedisModule } from '@modules/redis/redis.module';
import { MailerModule } from '@modules/mailer/mailer.module';
import { MailModule } from '@modules/mail/mail.module';
import { BookingsModule } from '@modules/bookings/bookings.module';
import { BillingsModule } from '@modules/billings/billings.module';
import { StripeModule } from '@modules/stripe/stripe.module';
import { WebhooksModule } from '@modules/webhooks/webhooks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from '@modules/jobs/jobs.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { TwilioModule } from '@modules/twilio/twilio.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { BannersModule } from '@modules/banners/banners.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            // cache: true,
            load: [
                appConfig,
                logConfig,
                databaseConfig,
                mailConfig,
                jwtConfig,
                redisConfig,
                fileConfig,
                stripeConfig,
                twilioConfig,
                socketioConfig,
            ],
            envFilePath: ['.env'],
        }),

        TypeOrmModule.forRootAsync({
            useClass: TypeOrmConfigService,
            dataSourceFactory: async (options: DataSourceOptions) => {
                return new DataSource(options).initialize();
            },
        }),

        EventEmitterModule.forRoot({
            wildcard: true,
            maxListeners: 500,
            verboseMemoryLeak: false,
        }),

        /* Import the rate limit module ttl: in milliseconds, Indicates that only limit requests can be made within ttl to avoid brute force attacks. */
        ThrottlerModule.forRoot([
            {
                ttl: 60_000,
                limit: 60,
            },
        ]),

        /* Connecting to cache wrapping redis */
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    host: configService.get<string>('redis.host'),
                    port: configService.get<number>('redis.port'),
                    password: configService.get<string>('redis.password') || null,
                }),
                ttl: 30_000,
            }),
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),

        AuthModule,
        AdminModule,
        RouterModule.register([
            {
                path: 'admin',
                module: AdminModule,
                children: [
                    {
                        path: 'roles',
                        module: RolesModule,
                    },
                    {
                        path: 'users',
                        module: UsersModule,
                    },
                ],
            },
        ]),
        MailerModule,
        MailModule,
        RedisModule,
        FilesModule,
        CurrenciesModule,
        CountriesModule,
        CitiesModule,
        FacilitiesModule,
        FeaturesModule,
        HotelsModule,
        RoomTypesModule,
        RoomsModule,
        GuestsModule,
        BookingsModule,
        BillingsModule,
        StripeModule,
        WebhooksModule,
        JobsModule,
        DashboardModule,
        TwilioModule,
        CategoriesModule,
        BannersModule,
        WebsocketModule,
        NotificationsModule,
    ],
    providers: [
        IsExist,
        IsNotExist,

        // Global Exception Filters
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },

        // Global return value conversion interceptor
        {
            provide: APP_INTERCEPTOR,
            useClass: ReponseTransformInterceptor,
        },

        // rate limit guard
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
