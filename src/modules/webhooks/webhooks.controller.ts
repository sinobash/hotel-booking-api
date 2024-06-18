import RequestWithRawBody from '@common/interfaces/request-with-raw-body.interface';
import { StripeService } from '@modules/stripe/stripe.service';
import { BadRequestException, Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';

/**
 * Webhook controller
 */
@Controller({
    path: 'webhooks',
})
export class WebhooksController {
    /**
     * @ignore
     */
    constructor(
        private readonly stripeService: StripeService,
        private readonly stripeWebhookService: StripeWebhookService,
    ) {}

    @Post('/stripe-payment-webhook')
    @HttpCode(HttpStatus.OK)
    async handleStripePaymentEvents(
        @Headers('stripe-signature') signature: string,
        @Req() request: RequestWithRawBody,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        let event;
        try {
            event = await this.stripeService.constructEventFromPayload(signature, request.rawBody);
            await this.stripeWebhookService.handleStripeEvent(event);
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }
}
