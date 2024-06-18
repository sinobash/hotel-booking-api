import { Injectable } from '@nestjs/common';
import fs from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';

@Injectable()
export class MailerService {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        if (this.configService.get<string>('app.nodeEnv') === 'development') {
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('mail.host', {
                    infer: true,
                }),
                service: this.configService.get('mail.mailer', {
                    infer: true,
                }),
                port: this.configService.get('mail.port', {
                    infer: true,
                }),
                auth: {
                    user: this.configService.get('mail.user', {
                        infer: true,
                    }),
                    pass: this.configService.get('mail.password', {
                        infer: true,
                    }),
                },
                secure: this.configService.get('mail.secure', { infer: true }),
                requireTLS: this.configService.get('mail.requireTLS', { infer: true }),
                tls: {
                    rejectUnauthorized: false,
                },
            });
        } else {
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('mail.host', {
                    infer: true,
                }),
                service: this.configService.get('mail.mailer', {
                    infer: true,
                }),
                port: this.configService.get('mail.port', {
                    infer: true,
                }),
                auth: {
                    user: this.configService.get('mail.user', {
                        infer: true,
                    }),
                    pass: this.configService.get('mail.password', {
                        infer: true,
                    }),
                },
                // ignoreTLS: this.configService.get('mail.ignoreTLS', { infer: true }),
                secure: this.configService.get('mail.secure', { infer: true }),
                requireTLS: this.configService.get('mail.requireTLS', { infer: true }),
                tls: {
                    rejectUnauthorized: true,
                },
            });
        }
    }

    async sendMail({
        templatePath,
        context,
        ...mailOptions
    }: nodemailer.SendMailOptions & {
        templatePath: string;
        context: Record<string, unknown>;
    }): Promise<any> {
        let html: string | undefined;
        if (templatePath) {
            const template = await fs.readFile(templatePath, 'utf-8');
            html = Handlebars.compile(template, {
                strict: true,
            })(context);
        }

        try {
            const info = await this.transporter.sendMail({
                ...mailOptions,
                from: mailOptions.from
                    ? mailOptions.from
                    : `"${this.configService.get<string>('mail.defaultName')}" <${this.configService.get<string>(
                          'mail.defaultEmail',
                      )}>`,
                html: mailOptions.html ? mailOptions.html : html,
            });
            return { message: `Message sent: ${info.messageId}`, success: true };
        } catch (error) {
            return { message: error.toString(), success: false };
        }
    }
}
