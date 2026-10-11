export abstract class AbstractError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code: number,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        this.code = code;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }

    // toString() {
    //     return this.getPrettyMessage();
    // }

    // getPrettyMessage() {
    //     return `${this.message} Code: ${this.code}.`;
    // }

    // toPlain() {
    //   return {
    //     code: this.code,
    //     message: this.message,
    //   };
    // }
}
