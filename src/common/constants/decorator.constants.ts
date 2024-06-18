/* Expiration in Milliseconds */
export const ONE_DAY_EXPIRATION_MS = 60 * 60 * 24; // 1 day expiration
export const ONE_HOUR_EXPIRATION_MS = 60 * 60 * 1; // 1 hour expiration
export const ONE_MINUTE_EXPIRATION_MS = 60 * 1; // 1 minute expiration

/* Maximum User Attempt */
export const MAXIMUM_USER_ATTEMPTS = 3; // 5 times

/* RegEx Collections */
export const STRONG_PASSWORD_REGEX = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;
