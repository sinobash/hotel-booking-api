import { AbstractError } from './abstract.error';

const AuthenticationErrors = {
    INVALID_CREDENTIALS: 1001,
};

class AuthenticationError extends AbstractError {
    static errors = AuthenticationErrors;
}

export default AuthenticationError;
