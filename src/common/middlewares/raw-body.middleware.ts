import { Response } from 'express';
import { json } from 'body-parser';
import RequestWithRawBody from '@common/interfaces/request-with-raw-body.interface';

function rawBodyMiddleware() {
    return json({
        verify: (request: RequestWithRawBody, response: Response, buffer: Buffer) => {
            if (request.url.indexOf('webhook') >= 0 && Buffer.isBuffer(buffer)) {
                request.rawBody = Buffer.from(buffer);
            }
            return true;
        },
    });
}

export default rawBodyMiddleware;
