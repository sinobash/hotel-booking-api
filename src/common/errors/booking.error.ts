import { AbstractError } from './abstract.error';

const BookingErrors = {
    INVALID_BOOKING: 1100,
    INVALID_BOOKING_STATUS: 1101,
    INVALID_BILLING: 1102,
    INVALID_BILLING_STATUS: 1103,
    INVALID_BOOKING_PRICE: 1104,
};

class BookingError extends AbstractError {
    static errors = BookingErrors;
}

export default BookingError;
