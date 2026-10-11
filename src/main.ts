import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ClassSerializerInterceptor, VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import validationOptions from '@common/utils/validation-options';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file';
import { SocketIoAdapter } from '@modules/websocket/io.adapter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true,
        rawBody: true,
    });
    /* enable DI for class-validator */
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const configService = app.get(ConfigService);

    /* sets HTTP headers to help protect applications from some well-known web vulnerabilities */
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    );

    const winstonInstance = winston.createLogger({
        transports: [
            // file on daily rotation (error only)
            new winston.transports.DailyRotateFile({
                level: 'error',
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }),
                    winston.format.printf(
                        (log) =>
                            `[${log.timestamp}] ${configService.get<string>('log.name')}.${log.level}: ${
                                log.message
                            } - ${log.stack}`,
                    ),
                ),
                dirname: configService.get<string>('log.dir'),
                filename: `%DATE%-error.log`,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
            // same for all levels
            new winston.transports.DailyRotateFile({
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }),
                    winston.format.printf(
                        (log) =>
                            `[${log.timestamp}] ${configService.get<string>('log.name')}.${log.level}: ${log.message}`,
                    ),
                ),
                dirname: configService.get<string>('log.dir'),
                filename: '%DATE%-combined.log',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: false,
                maxFiles: '30d',
            }),
            new winston.transports.Console({
                level: configService.get<string>('nodeEnv') === 'production' ? 'info' : 'silly',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    nestWinstonModuleUtilities.format.nestLike(configService.get<string>('log.name'), {
                        colors: true,
                        prettyPrint: true,
                    }),
                ),
            }),
        ],
    });
    app.useLogger(
        WinstonModule.createLogger({
            instance: winstonInstance,
        }),
    );

    app.setGlobalPrefix(configService.get<string>('app.apiPrefix'));
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: [VERSION_NEUTRAL, '1', '2'],
    });
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    /* set websocket adapter */
    app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

    /* enable validation globally */
    app.useGlobalPipes(new ValidationPipe(validationOptions));

    await app.listen(configService.get<number>('app.port'));
}
bootstrap();
