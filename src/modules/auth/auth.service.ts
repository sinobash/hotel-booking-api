import { GuestsService } from '@modules/guests/guests.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    SendOtpEmailDto,
    RegisterByEmailOtpDto,
    RegisterByMobileDto,
    SendOtpMobileNumberDto,
} from './dto/register.dto';
import { generateRandomNumber } from '@common/utils/app.helper';
import { RedisService } from '@modules/redis/redis.service';
import { USER_OTP_KEY } from '@common/constants/redis.contant';
import { ONE_MINUTE_EXPIRATION_MS } from '@common/constants/decorator.constants';
import { MailService } from '@modules/mail/mail.service';
import { TwilioService } from '@modules/twilio/twilio.service';
import { DateTime } from 'luxon';
import { Guest } from '@modules/guests/entities/guest.entity';
import { UserData } from '@common/interfaces/user-data.interface';
import { doCompare, doHash } from '@common/utils/crypt.helper';
import { AUTH_MESSAGES } from '@common/constants/app.constants';
import { LoginResponseType } from './types/login-response.type';
import { AuthEmailLoginDto, AuthMobileNumberLoginDto } from './dto/auth.dto';
import { ActivationEnum, TwilioMessageDeliveryStatus } from '@common/enums/status.enum';
import AuthenticationError from '@common/errors/authentication.error';
import UserError from '@common/errors/user.error';
import AppError from '@common/errors/app.error';

@Injectable()
export class AuthService {
    /**
     * @ignore
     */
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
        private readonly guestsService: GuestsService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        private readonly twilioService: TwilioService,
    ) {}

    private async storeOtp(key: string): Promise<string> {
        // generate otp and store in redis
        const otpCode = generateRandomNumber(4);
        const ttl = ONE_MINUTE_EXPIRATION_MS * 2; // 2 minutes otp expirations
        const ttlInMs = DateTime.fromJSDate(new Date()).plus({ seconds: ttl }).toUnixInteger();
        const redisStored = await this.redisService.insert(USER_OTP_KEY.concat(':', key), otpCode, ttlInMs);
        if (redisStored === 'OK') {
            const storedOtp = await this.redisService.get(USER_OTP_KEY.concat(':', key));
            this.logger.log(`otp ${otpCode} created successfully`);
            return storedOtp;
        }
        return null;
    }

    async verifyOtp(key: string, otpCode: string): Promise<boolean> {
        // validate otp stored in redis
        const isValidOtp = await this.redisService.validate(USER_OTP_KEY.concat(':', key), otpCode);
        return !!isValidOtp;
    }

    async checkEmail(email: string): Promise<boolean> {
        return await this.guestsService.checkEmailExist(email); // check email availability
    }

    async sendOtpByEmail(payload: SendOtpEmailDto): Promise<any> {
        const emailExist = await this.checkEmail(payload.email);
        if (emailExist) {
            throw new UserError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                `Email is already taken by another guest`,
                UserError.errors.EMAIL_ADDRESS_ALREADY_REGISTERED_WITH_ANOTHER_USER,
            );
        }
        const otpCode = await this.storeOtp(payload.email);
        if (!otpCode) {
            this.logger.error(`An unknown exception was thrown: cannot store otp code`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: cannot store otp code`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
        const sendEmail = await this.mailService.registerVerification({
            to: payload.email,
            data: {
                code: otpCode,
            },
        });
        if (!sendEmail.success) {
            this.logger.error(`An unknown exception from email was thrown: ${sendEmail.message}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception from email was thrown: ${sendEmail.message}`,
                AppError.errors.EMAIL_ERROR,
            );
        }
        return {
            email: payload.email,
        };
    }

    async registerByEmail(payload: RegisterByEmailOtpDto): Promise<any> {
        const emailExist = await this.checkEmail(payload.email);
        if (emailExist) {
            throw new UserError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                `Email is already taken by another guest`,
                UserError.errors.EMAIL_ADDRESS_ALREADY_REGISTERED_WITH_ANOTHER_USER,
            );
        }
        const isValidOtp = await this.verifyOtp(payload.email, payload.code);
        if (!isValidOtp) {
            this.logger.error(`The otp ${payload.code} provided was invalid`);
            throw new AppError(
                HttpStatus.UNAUTHORIZED,
                `The otp provided was invalid`,
                AppError.errors.INVALID_OTP_CODE,
            );
        }
        const guest = await this.guestsService.create({
            email: payload.email,
            username: payload.email,
            phoneNumber: null,
            fullName: payload.fullName,
            password: await doHash(payload.password),
        });
        this.logger.log(`register for ${payload.fullName} success`);
        // send email for registration complete information
        const sendEmail = await this.mailService.registerComplete({
            to: payload.email,
            data: {
                fullName: payload.fullName,
                code: payload.code,
            },
        });
        if (!sendEmail.success) {
            this.logger.error(`An unknown exception from email was thrown: ${sendEmail.message}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception from email was thrown: ${sendEmail.message}`,
                AppError.errors.EMAIL_ERROR,
            );
        }
        const { accessToken } = await this.getTokensData({
            guest: guest,
        });
        return {
            accessToken,
        };
    }

    async checkMobileNumber(phoneNumber: string): Promise<boolean> {
        return await this.guestsService.checkMobileNumberExist(phoneNumber);
    }

    async sendOtpByMobileNumber(payload: SendOtpMobileNumberDto): Promise<any> {
        try {
            const sendOtp = await this.twilioService.generateTwilioOtp(payload.mobileNumber);
            return sendOtp;
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async checkOtpByMobileNumber(payload: RegisterByMobileDto): Promise<any> {
        try {
            const checkOtp = await this.twilioService.verifyTwilioOtp(payload.mobileNumber, payload.code);
            return checkOtp;
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async registerByMobileNumber(payload: RegisterByMobileDto): Promise<any> {
        const mobileNumberExist = await this.checkMobileNumber(payload.mobileNumber);
        if (mobileNumberExist) {
            throw new UserError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                `Mobile phone is already taken by another user`,
                UserError.errors.MOBILE_PHONE_ALREADY_REGISTERED_WITH_ANOTHER_USER,
            );
        }
        const checkOtp = await this.twilioService.verifyTwilioOtp(payload.mobileNumber, payload.code);
        if (!checkOtp) {
            this.logger.error(`The otp ${payload.code} provided was invalid`);
            throw new AppError(
                HttpStatus.UNAUTHORIZED,
                `The otp provided was invalid`,
                AppError.errors.INVALID_OTP_CODE,
            );
        }
        const guest = await this.guestsService.create({
            ...payload,
            phoneNumber: payload.mobileNumber,
            username: payload.mobileNumber,
            email: null,
            password: await doHash(payload.password),
        });
        this.logger.log(`register for ${payload.fullName} success`);
        // send sms for registration complete information
        const sendSms = await this.twilioService.sendMessage(
            payload.mobileNumber,
            `Registration Complete for ${payload.fullName}`,
        );
        if (
            sendSms.status === TwilioMessageDeliveryStatus.FAILED ||
            sendSms.status === TwilioMessageDeliveryStatus.UNDELIVERED
        ) {
            this.logger.error(`Exception from sms was thrown: ${sendSms.errorMessage}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `Exception from sms was thrown: ${sendSms.errorMessage}`,
                AppError.errors.SMS_ERROR,
            );
        }
        const { accessToken } = await this.getTokensData({
            guest: guest,
        });
        return {
            accessToken,
        };
    }

    private async getTokensData(data: { guest: Pick<Guest, 'id' | 'username'> }) {
        const tokenExpiresIn = this.configService.get<string>('jwt.expires');
        const [accessToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    sub: data.guest.username,
                    key: data.guest.id,
                } as UserData,
                {
                    secret: this.configService.getOrThrow('jwt.secret'),
                    expiresIn: tokenExpiresIn,
                },
            ),
        ]);
        return {
            accessToken,
        };
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const guest = await this.guestsService.findUsername({
            username: username,
            isActive: ActivationEnum.ACTIVE,
        });
        if (!guest) {
            throw new UserError(HttpStatus.UNAUTHORIZED, `The username is invalid`, UserError.errors.INVALID_USER_NAME);
        }
        const isValidPassword = await doCompare(pass, guest.password);
        if (!isValidPassword) {
            throw new AuthenticationError(
                HttpStatus.UNAUTHORIZED,
                AUTH_MESSAGES.INVALID_CREDENTIALS,
                AuthenticationError.errors.INVALID_CREDENTIALS,
            );
        }
        return this.guestsService.findById(guest.id);
    }

    async loginByEmail(loginDto: AuthEmailLoginDto): Promise<LoginResponseType> {
        const guest = await this.validateUser(loginDto.email, loginDto.password);
        const { accessToken } = await this.getTokensData({
            guest: guest,
        });
        // Update last login
        await this.guestsService.updateLastLogin(guest);
        return {
            accessToken,
        };
    }

    async loginByMobileNumber(loginDto: AuthMobileNumberLoginDto): Promise<LoginResponseType> {
        const guest = await this.validateUser(loginDto.mobileNumber, loginDto.password);
        const { accessToken } = await this.getTokensData({
            guest: guest,
        });
        // Update last login
        await this.guestsService.updateLastLogin(guest);
        return {
            accessToken,
        };
    }
}
