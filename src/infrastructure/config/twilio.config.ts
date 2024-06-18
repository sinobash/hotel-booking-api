import { registerAs } from '@nestjs/config';
import { TwilioConfig } from './config.type';

export default registerAs<TwilioConfig>('twilio', () => {
    return {
        accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
        authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
        verificationServiceId: process.env.TWILIO_VERIFICATION_SERVICE_SID ?? '',
        senderPhoneNumber: process.env.TWILIO_SENDER_PHONE_NUMBER ?? '+13136318161',
    };
});
