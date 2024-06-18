import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeCaseNamingStrategy } from './strategy/snake-case-naming.strategy';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();
export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: Number(configService.get('DB_PORT')),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    synchronize: false,
    logging: true,
    entities: ['../../modules/**/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    namingStrategy: new SnakeCaseNamingStrategy(),
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
