export enum ActivationEnum {
    INACTIVE = 0,
    ACTIVE = 1,
}

export enum VerificationEnum {
    UNVERIFIED = 0,
    VERIFIED = 1,
}

export enum BookingStatus {
    REQUESTED = 'requested',
    PENDING = 'pending',
    BOOKED = 'booked',
    READY_TO_CHECKEDIN = 'ready-to-checked-in',
    CHECKEDIN = 'checked-in',
    CHECKEDOUT = 'checked-out',
    CANCELED = 'canceled',
    ABANDONED = 'abandoned',
}

export enum BillingStatus {
    UNPAID = 'unpaid',
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    DECLINED = 'declined',
    CANCELED = 'canceled',
    ABANDONED = 'abandoned',
    REFUNDED = 'refunded',
}

export enum StripePaymentIntentStatus {
    REQUIRES_PAYMENT_METHOD = 'requires_payment_method', // The customer’s payment failed on your checkout page
    REQUIRES_CONFIRMATION = 'requires_confirmation',
    REQUIRES_ACTION = 'requires_action', // The customer didn’t complete the checkout
    PROCESSING = 'processing', // The customer’s payment was submitted to Stripe successfully
    SUCCEEDED = 'succeeded', // The customer completed payment on your checkout page, The customer’s payment succeeded
    CANCELED = 'canceled',
}

export enum AvailableEnum {
    UNAVAILABLE = 0,
    AVAILABLE = 1,
}

export enum AvailabilityStatus {
    VACANT = 'vacant',
    BOOKED = 'booked',
    FULL = 'full',
    CANCEL = 'cancel',
}

export enum TwilioVerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    CANCELED = 'canceled',
}

export enum TwilioMessageDeliveryStatus {
    SENT = 'sent',
    UNKNOWN = 'delivery_unknown',
    DELIVERED = 'delivered',
    UNDELIVERED = 'undelivered',
    FAILED = 'failed',
}

export enum HouseKeepingStatus {
    CLEAN = 'clean',
    REPAIR = 'repair',
    REPAIR_DNR = 'repair_dnr',
    INSPECT = 'inspect',
    DIRTY = 'dirty',
    DIRTY_DEPARTING = 'dirty_departing',
    DIRTY_VACANT = 'dirty_vacant',
    DO_NOT_DISTURB = 'do_not_disturb',
    STAY_OVER = 'stay_over',
}
