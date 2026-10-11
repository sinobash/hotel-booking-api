import { MailerService } from '@modules/mailer/mailer.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailData } from './interfaces/mail-data.interface';
import path from 'node:path';
import {
    REGISTER_VERIFY_TEMPLATES,
    EMAIL_TEMPLATES,
    REGISTER_COMPLETE_TEMPLATES,
    BOOKING_COMPLETE_TEMPLATES,
    BOOKING_CANCELED_TEMPLATES,
} from './constants/email.constants';

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {}

    async registerVerification(mailData: MailData<{ code: string }>): Promise<any> {
        const accountRegisterTitle = EMAIL_TEMPLATES.REGISTER_VERIFY_TEXT;
        const mailHeading = REGISTER_VERIFY_TEMPLATES.MAIL_HEADING;
        const text1 = REGISTER_VERIFY_TEMPLATES.TEXT1;
        const text2 = REGISTER_VERIFY_TEMPLATES.TEXT2;
        const text3 = REGISTER_VERIFY_TEMPLATES.TEXT3;

        return await this.mailerService.sendMail({
            from: `"${this.configService.get<string>('mail.defaultName')}" <${this.configService.get<string>(
                'mail.defaultEmail',
            )}>`,
            to: mailData.to,
            subject: accountRegisterTitle,
            text: `Your OTP Code: ${mailData.data.code}`,
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory'),
                'src/modules',
                'mail',
                'mail-templates',
                'register-verification.hbs',
            ),
            context: {
                title: accountRegisterTitle,
                app_name: this.configService.get<string>('app.name'),
                mail_heading: mailHeading,
                mail_account: mailData.to,
                otp_code: mailData.data.code,
                text1,
                text2,
                text3,
            },
        });
    }

    async registerComplete(mailData: MailData<{ fullName: string; code: string }>): Promise<any> {
        const accountRegisterTitle = EMAIL_TEMPLATES.REGISTER_COMPLETE_TEXT;
        const mailHeading = REGISTER_COMPLETE_TEMPLATES.MAIL_HEADING;
        const text1 = REGISTER_COMPLETE_TEMPLATES.TEXT1;
        const text2 = REGISTER_COMPLETE_TEMPLATES.TEXT2;
        const text3 = REGISTER_COMPLETE_TEMPLATES.TEXT3;
        const text4 = REGISTER_COMPLETE_TEMPLATES.TEXT4;

        return await this.mailerService.sendMail({
            from: `"${this.configService.get<string>('mail.defaultName')}" <${this.configService.get<string>(
                'mail.defaultEmail',
            )}>`,
            to: mailData.to,
            subject: accountRegisterTitle,
            text: `Registration Complete for  ${mailData.data.fullName}`,
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory'),
                'src/modules',
                'mail',
                'mail-templates',
                'register-complete.hbs',
            ),
            context: {
                title: accountRegisterTitle,
                app_name: this.configService.get<string>('app.name'),
                mail_heading: mailHeading,
                mail_account_name: mailData.data.fullName,
                text1,
                text2,
                text3,
                text4,
            },
        });
    }

    async bookingFinish(
        mailData: MailData<{
            fullName: string;
            currencyCode: string;
            code: string;
            totalPrice: number;
            currentDate: string;
            hotelName: string;
            roomTypePrice: number;
        }>,
    ): Promise<any> {
        const bookingCompleteTitle = EMAIL_TEMPLATES.BOOKING_COMPLETE_TEXT;
        const mailHeading = BOOKING_COMPLETE_TEMPLATES.MAIL_HEADING;
        const text1 = BOOKING_COMPLETE_TEMPLATES.TEXT1;

        return await this.mailerService.sendMail({
            from: `"${this.configService.get<string>('mail.defaultName')}" <${this.configService.get<string>(
                'mail.defaultEmail',
            )}>`,
            to: mailData.to,
            subject: bookingCompleteTitle,
            text: `Payment Process is Success for Booking Order ID #${mailData.data.code}`,
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory'),
                'src/modules',
                'mail',
                'mail-templates',
                'booking-complete.hbs',
            ),
            context: {
                title: mailData,
                app_name: this.configService.get<string>('app.name'),
                mail_heading: mailHeading,
                mail_account_name: mailData.data.fullName,
                text1,
                currency_code: mailData.data.currencyCode,
                order_id: mailData.data.code,
                total_price: mailData.data.totalPrice,
                hotel_name: mailData.data.hotelName,
                room_type_price: mailData.data.roomTypePrice,
                formatted_current_date: mailData.data.currentDate,
            },
        });
    }

    async bookingComplete(
        mailData: MailData<{
            fullName: string;
            currencyCode: string;
            code: string;
            totalPrice: number;
            currentDate: string;
        }>,
    ): Promise<any> {
        const bookingCompleteTitle = EMAIL_TEMPLATES.BOOKING_COMPLETE_TEXT;
        const mailHeading = BOOKING_COMPLETE_TEMPLATES.MAIL_HEADING;
        const text1 = BOOKING_COMPLETE_TEMPLATES.TEXT1;

        return await this.mailerService.sendMail({
            from: `"${this.configService.get<string>('mail.defaultName')}" <${this.configService.get<string>(
                'mail.defaultEmail',
            )}>`,
            to: mailData.to,
            subject: bookingCompleteTitle,
            text: `Payment Process is Success for Booking Order ID #${mailData.data.code}`,
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory'),
                'src/modules',
                'mail',
                'mail-templates',
                'booking-complete.hbs',
            ),
            context: {
                title: mailData,
                app_name: this.configService.get<string>('app.name'),
                mail_transaction_status: mailHeading,
                mail_account_name: mailData.data.fullName,
                text1,
                currency_code: mailData.data.currencyCode,
                order_id: mailData.data.code,
                total_price: mailData.data.totalPrice,
                formatted_current_date: mailData.data.currentDate,
            },
        });
    }

    async bookingCancel(
        mailData: MailData<{
            fullName: string;
            currencyCode: string;
            code: string;
            totalPrice: number;
            currentDate: string;
        }>,
    ): Promise<any> {
        const bookingCancelTitle = EMAIL_TEMPLATES.BOOKING_CANCEL_TEXT;
        const mailHeading = BOOKING_CANCELED_TEMPLATES.MAIL_HEADING;
        const text1 = BOOKING_CANCELED_TEMPLATES.TEXT1;

        return await this.mailerService.sendMail({
            from: `"${this.configService.get<string>('mail.defaultName')}" <${this.configService.get<string>(
                'mail.defaultEmail',
            )}>`,
            to: mailData.to,
            subject: bookingCancelTitle,
            text: `Unsuccessful Payment Process for Booking Order ID #${mailData.data.code}`,
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory'),
                'src/modules',
                'mail',
                'mail-templates',
                'booking-canceled.hbs',
            ),
            context: {
                title: mailData,
                app_name: this.configService.get<string>('app.name'),
                mail_transaction_status: mailHeading,
                mail_account_name: mailData.data.fullName,
                text1,
                currency_code: mailData.data.currencyCode,
                order_id: mailData.data.code,
                total_price: mailData.data.totalPrice,
                formatted_current_date: mailData.data.currentDate,
            },
        });
    }
}
