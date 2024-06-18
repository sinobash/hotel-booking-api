import { Injectable, NestInterceptor, Logger, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();

        response.on('finish', () => {
            const { method, originalUrl } = request;
            const { statusCode, statusMessage } = response;

            const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;

            if (statusCode >= 500) {
                return this.logger.error(message);
            }

            if (statusCode >= 400 && statusCode < 500) {
                return this.logger.warn(message);
            }

            return this.logger.log(message);
        });

        return next.handle();
    }
}
