export class ApiResponse {
    timestamp: number;
    readonly status: string;
    readonly code: number;
    readonly message: string;
    [key: string]: any;

    constructor(status: number, message: string, data: any) {
        this.timestamp = Math.floor(Date.now() / 1000);
        this.status = 200 >= status && status <= 250 ? 'success' : 'error';
        this.code = status;
        this.message = message.toLowerCase();
        Object.assign(this, data);
    }

    static success(data?: any, message = 'The request was successful') {
        return new ApiResponse(200, message, data);
    }

    static error(message = 'The request was unsuccessful', status = 500) {
        return new ApiResponse(status, message, null);
    }
}
