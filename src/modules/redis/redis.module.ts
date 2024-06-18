import { IORedisKey } from '@common/constants/redis.contant';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';

@Module({
    providers: [
        /* Provide redis */
        {
            provide: IORedisKey,
            useFactory: (configService: ConfigService) => {
                return new Redis({
                    host: configService.get<string>('redis.host'),
                    port: configService.get<number>('redis.port'),
                    password: configService.get<string>('redis.password') || null,
                    // This is the default value of `retryStrategy`
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                    reconnectOnError(err) {
                        const targetError = 'READONLY';
                        if (err.message.includes(targetError)) {
                            // Only reconnect when the error contains "READONLY"
                            return true; // or `return 1;`
                        }
                    },
                });
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: [RedisService],
})
export class RedisModule {}
