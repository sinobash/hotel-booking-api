import { TwilioVerificationStatus } from '@common/enums/status.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
    private twilioClient: Twilio;

    constructor(private readonly configService: ConfigService) {
        const accountSid = configService.get<string>('twilio.accountSid');
        const authToken = configService.get<string>('twilio.authToken');

        this.twilioClient = new Twilio(accountSid, authToken);
    }

    async verifyService(phoneNumber: string, channel = 'sms') {
        const serviceSid = this.configService.get<string>('twilio.verificationServiceId');
        try {
            const verification = await this.twilioClient.verify.v2
                .services(serviceSid)
                .verifications.create({ to: phoneNumber, channel: channel });
            return verification;
        } catch (e) {
            // Verify landlines using voice
            if (e instanceof Error && e.message.includes('SMS is not supported by landline phone number')) {
                const verification = await this.twilioClient.verify.v2
                    .services(serviceSid)
                    .verifications.create({ to: phoneNumber, channel: channel });
                return verification;
            } else {
                throw e;
            }
        }
    }

    async verificationCheckService(phoneNumber: string, otpCode: string) {
        const serviceSid = this.configService.get<string>('twilio.verificationServiceId');
        try {
            const verificationCheck = await this.twilioClient.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code: otpCode });
            return verificationCheck;
        } catch (e) {
            // Verify landlines using voice
            if (e instanceof Error && e.message.includes('SMS is not supported by landline phone number')) {
                const verificationCheck = await this.twilioClient.verify.v2
                    .services(serviceSid)
                    .verificationChecks.create({ to: phoneNumber, code: otpCode });
                return verificationCheck;
            } else {
                throw e;
            }
        }
    }

    async initiatePhoneNumberVerification(phoneNumber: string) {
        const verification = await this.verifyService(phoneNumber);
        return verification.sid;
    }

    async generateTwilioOtp(phoneNumber: string): Promise<boolean> {
        const verification = await this.verifyService(phoneNumber);
        if (verification.status === TwilioVerificationStatus.PENDING) {
            return true;
        }
        return false;
    }

    async verifyTwilioOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
        const verificationCheck = await this.verificationCheckService(phoneNumber, otpCode);
        const { status } = verificationCheck;
        if (status === TwilioVerificationStatus.APPROVED || TwilioVerificationStatus.PENDING) {
            return true;
        }
        return false;
    }

    async sendMessage(phoneNumber: string, message: string) {
        const senderPhoneNumber = this.configService.get<string>('twilio.senderPhoneNumber');

        return this.twilioClient.messages.create({ body: message, from: senderPhoneNumber, to: phoneNumber });
    }
}
