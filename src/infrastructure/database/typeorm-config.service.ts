import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeCaseNamingStrategy } from './strategy/snake-case-naming.strategy';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
        return {
            type: 'postgres',
            url: this.configService.get('database.url'),
            host: this.configService.get('database.host'),
            port: Number(this.configService.get('database.port')),
            username: this.configService.get('database.username'),
            password: this.configService.get('database.password'),
            database: this.configService.get('database.name'),
            synchronize: this.configService.get('database.synchronize'),
            dropSchema: false,
            keepConnectionAlive: true,
            logging: this.configService.get('app.nodeEnv') !== 'production',
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/migrations/*{.ts,.js}'],
            migrationsRun: false,
            namingStrategy: new SnakeCaseNamingStrategy(),
            cli: {
                entitiesDir: '../../modules/**/entities',
                migrationsDir: __dirname + '/migrations',
            },
            cache: {
                type: 'ioredis',
                options: {
                    host: this.configService.get<string>('redis.host'),
                    port: this.configService.get<number>('redis.port'),
                    password: this.configService.get<string>('redis.password') || null,
                },
            },
            extra: {
                // based on https://node-postgres.com/apis/pool
                // max connection pool size
                max: this.configService.get('database.maxConnections'),
                ssl: this.configService.get('database.sslEnabled')
                    ? {
                          rejectUnauthorized: this.configService.get('database.rejectUnauthorized'),
                          //   ca: this.configService.get('database.ca') ?? undefined,
                          //   key: this.configService.get('database.key') ?? undefined,
                          //   cert: this.configService.get('database.cert') ?? undefined,
                      }
                    : undefined,
            },
        } as TypeOrmModuleAsyncOptions;
    }
}
