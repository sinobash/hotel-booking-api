import { ValidationPipeOptions, HttpStatus, ValidationError, BadRequestException } from '@nestjs/common';

const validationOptions: ValidationPipeOptions = {
    transform: true,
    whitelist: true,
    // forbidNonWhitelisted: true,
    // transformOptions: {
    //   enableImplicitConversion: true,
    // },
    errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
            validationErrors.map((error) => ({
                field: error.property,
                error: Object.values(error.constraints).join(', '),
            })),
        );
    },
};

export default validationOptions;
