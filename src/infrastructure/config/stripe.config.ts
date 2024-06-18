import { registerAs } from '@nestjs/config';
import { StripeConfig } from './config.type';

export default registerAs<StripeConfig>('stripe', () => {
    return {
        apiVersion: process.env.STRIPE_API_VERSION,
        publicAccessKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretAccessKey: process.env.STRIPE_SECRET_KEY,
        webHookSecretkey: process.env.STRIPE_WEBHOOK_SECRET,
        defaultCurrency: process.env.STRIPE_DEFAULT_CURRENCY,
        paymentExpires: parseInt(process.env.STRIPE_PAYMENT_EXPIRES_IN) || 300,
    };
});
