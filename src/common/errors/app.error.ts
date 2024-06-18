import { AbstractError } from './abstract.error';

const AppErrors = {
    INVALID_CREDENTIALS: 1001,
    INVALID_API_OPERATION: 1002,
    INTERNAL_ERROR: 1003,
    INVALID_PERMISSIONS: 1004,
    MAX_FILE_SIZE_EXCEEDED: 1005,
    DATA_NOT_FOUND: 1006,
    DATA_KEY_NOT_FOUND: 1007,
    MISSING_STRIPE_SIGNATURE: 1008,
    STRIPE_WEBHOOK_ERROR: 1009,
    INVALID_OTP_CODE: 1010,
    EMAIL_ERROR: 1011,
    SMS_ERROR: 1012,
    DUPLICATE_ERROR: 1013,
};

class AppError extends AbstractError {
    static errors = AppErrors;
}

export default AppError;
