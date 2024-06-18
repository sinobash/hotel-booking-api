export const CRUD_MESSAGES = {
    DATA_CREATED: 'data has been created successfully',
    DATA_UPDATED: 'data has been successfully modified',
    DATA_DELETED: 'data has been deleted successfully',
    DATA_RETRIEVED: 'data has been retrieved',
    DATA_CREATED_FAIL: 'data failed to create',
    DATA_UPDATED_FAIL: 'data failed to change',
    DATA_DELETED_FAIL: 'data failed to delete',
    DATA_RETRIEVED_FAIL: 'data failed to retrieve',
};

export const SEARCH_MESSAGES = {
    DATA_FOUND: 'data has been found',
    DATA_NOT_FOUND: 'data cannot be found',
};

export const VALIDATION_MESSAGES = {
    EMAIL_NOT_AVAILABLE: 'email is already registered',
    PHONE_NUMBER_NOT_AVAILABLE: 'phone number is already registered',
    ROLE_NOT_AVAILABLE: 'role is already registered',
};

export const AUTH_MESSAGES = {
    ACCOUNT_NOT_FOUND: 'Account not found',
    INVALID_PASSWORD: 'Please make sure that your password is correct',
    INVALID_TOKEN: 'Invalid token',
    REQUIRE_VALID_TOKEN: 'Please provide a valid token',
    REQUIRE_VALID_ACCOUNT: 'Please provide a valid account details',
    INVALID_CREDENTIALS: 'The username and password provided was invalid',
    SESSION_EXPIRED: 'Your session has expired. Please login to pick up where you left off',
};

export const UPLOAD_GROUP = {
    MEDIA: 'media',
    HOTELS: 'hotels',
    ROOM_TYPES: 'room-types',
    ROOMS: 'rooms',
    DOCUMENTS: 'documents',
    AVATARS: 'avatars',
    BANNERS: 'banners',
};

export const FORBIDDEN_MESSAGES = {
    FORBIDDEN_ACCESS: `You don't have authorization to access this resource`,
    FORBIDDEN_BRANCH_ACCESS: `You need to be assigned to access this resource`,
};
