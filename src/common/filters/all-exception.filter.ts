import { AbstractError } from '@common/errors/abstract.error';
import { ApiException } from '@common/exceptions/api.exception';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        const response = httpContext.getResponse();
        const request = httpContext.getRequest();
        const status = this.getExceptionStatus(exception);
        const body = this.errorResult(request.url, exception);
        const stack = this.getStackTrace(exception);

        this.logger.error(`${request.method} ${request.url}`, JSON.stringify(body), stack);

        response.status(status).json(body);
    }

    errorResult(path: string, exception: unknown) {
        const status = this.getExceptionStatus(exception);
        const code = this.getExceptionCode(exception);
        const message = this.getExceptionMessage(exception);

        let error: string;
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            error = (response as any).message ?? response;
        }
        // else {
        //     error = `${exception}`;
        // }

        const errorResponse: any = {
            timestamp: Math.floor(Date.now() / 1000),
            status: 200 >= status && status <= 250 ? 'success' : 'error',
            // status: status,
            code: code,
            message: message,
            errors: error,
            path: path,
            // traceId: this.randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').toLowerCase(),
        };

        return errorResponse;
    }

    randomString(length: number, chars: string) {
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    getExceptionStatus(exception: unknown) {
        let result: any;
        if (exception instanceof HttpException) {
            result = exception.getStatus();
        } else if (exception instanceof AbstractError) {
            result = exception.statusCode;
        } else {
            result = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return result;
    }

    getExceptionCode(exception: unknown) {
        let result: any;
        if (exception instanceof HttpException) {
            result = exception.getStatus();
        } else if (exception instanceof ApiException) {
            result = exception.getErrCode();
        } else if (exception instanceof AbstractError) {
            result = exception.code;
        } else {
            result = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return result;
    }

    getExceptionMessage(exception: unknown) {
        let result: any;
        if (exception instanceof HttpException) {
            result = exception.message.toLowerCase();
        } else if (exception instanceof ApiException) {
            result = exception.getMsg().toLowerCase();
        } else if (exception instanceof AbstractError) {
            result = exception.message.toLowerCase();
        } else {
            result = 'internal server error';
        }
        return result;
    }

    getStackTrace(exception: unknown) {
        let stackTrace: any;
        if (exception instanceof HttpException) {
            stackTrace = exception.stack;
        } else if (exception instanceof ApiException) {
            stackTrace = exception.getStack();
        } else if (exception instanceof AbstractError) {
            stackTrace = exception.stack;
        } else {
            stackTrace = 'TypeError';
        }
        return stackTrace;
    }
}
