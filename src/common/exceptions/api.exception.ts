import { HttpException } from '@nestjs/common';

export class ApiException extends HttpException {
    private errCode: number;
    constructor(msg: string, errCode?: number) {
        // For permission issues, always use the 401 error code
        if (errCode && errCode == 401) {
            super(msg, 200);
            this.errCode = 401;
        } else {
            // For other exceptions, use the 500 error code
            super(msg, errCode ?? 200);
            this.errCode = errCode ?? 500;
        }
    }
    getErrCode(): number {
        return this.errCode;
    }
    getMsg(): any {
        return this.message;
    }
    getStack(): any {
        return this.stack;
    }
}
