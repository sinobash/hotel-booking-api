import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    CheckEmailDto,
    SendOtpEmailDto,
    RegisterByEmailOtpDto,
    CheckMobileNumberDto,
    SendOtpMobileNumberDto,
    RegisterByMobileDto,
} from './dto/register.dto';
import { AuthEmailLoginDto, AuthMobileNumberLoginDto } from './dto/auth.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { LoginResponseType } from './types/login-response.type';

/**
 * Guest side authentication controller
 */
@Controller({
    path: 'auth',
})
export class AuthController {
    /**
     * @ignore
     */
    constructor(private readonly authService: AuthService) {}

    /**
     * Check guest email availability
     * @param payload
     * See the [definition of the CheckEmailDto file]{@link CheckEmailDto} to see a list of required properties
     * @returns a promise with the result
     */
    @Post('/check-email')
    @HttpCode(HttpStatus.OK)
    async checkEmail(@Body() payload: CheckEmailDto): Promise<any> {
        const result = await this.authService.checkEmail(payload.email);
        const message = result ? 'Please provide another email to register' : 'You can use provided email for register';
        const response = !result;
        return { message: message, data: response };
    }

    /**
     * Send OTP to email
     * @param payload
     * See the [definition of the SendOtpEmailDto file]{@link SendOtpEmailDto} to see a list of required properties
     * @returns a promise with the result
     */
    @Post('/send-otp-to-email')
    @HttpCode(HttpStatus.OK)
    async sendOtpEmail(@Body() payload: SendOtpEmailDto): Promise<any> {
        const result = await this.authService.sendOtpByEmail(payload);
        const message = 'The OTP Code already sent to the email';
        return { message: message, data: result };
    }

    /**
     * Register guest by email
     * @param payload
     * See the [definition of the RegisterByEmailOtpDto file]{@link RegisterByEmailOtpDto} to see a list of required properties
     * @returns a promise with the token result
     */
    @Post('/register-by-email')
    @HttpCode(HttpStatus.OK)
    async registerEmail(@Body() payload: RegisterByEmailOtpDto): Promise<any> {
        const result = await this.authService.registerByEmail(payload);
        const message = 'Registration Successful';
        return { message: message, data: result };
    }

    /**
     * Login guest by email
     * @param payload
     * See the [definition of the AuthEmailLoginDto file]{@link AuthEmailLoginDto} to see a list of required properties
     * @returns a promise with the token result
     */
    @Post('/login-email')
    @HttpCode(HttpStatus.OK)
    async loginByEmail(@Body() payload: AuthEmailLoginDto): Promise<ResponseResultType<LoginResponseType>> {
        const result = await this.authService.loginByEmail(payload);
        return { data: result };
    }

    /**
     * Check guest mobile number availability
     * @param payload
     * See the [definition of the CheckMobileNumberDto file]{@link CheckMobileNumberDto} to see a list of required properties
     * @returns a promise with the result
     */
    @Post('/check-mobile-number')
    @HttpCode(HttpStatus.OK)
    async checkMobileNumber(@Body() payload: CheckMobileNumberDto): Promise<any> {
        const result = await this.authService.checkMobileNumber(payload.mobileNumber);
        const message = result
            ? 'Please provide another mobile number to register'
            : 'You can use provided mobile number for register';
        const response = !result;
        return { message: message, data: response };
    }

    /**
     * Send OTP to mobile number
     * @param payload
     * See the [definition of the SendOtpMobileNumberDto file]{@link SendOtpMobileNumberDto} to see a list of required properties
     * @returns a promise with the result
     */
    @Post('/send-otp-to-mobile')
    @HttpCode(HttpStatus.OK)
    async sendOtpMobileNumber(@Body() payload: SendOtpMobileNumberDto): Promise<any> {
        const result = await this.authService.sendOtpByMobileNumber(payload);
        const message = result ? 'The OTP Code already sent to the mobile number' : 'The OTP Code cannot be sent';
        return { message: message, data: result };
    }

    /**
     * Check OTP by mobile number
     * @param payload
     * See the [definition of the RegisterByMobileDto file]{@link RegisterByMobileDto} to see a list of required properties
     * @returns a promise with the result
     */
    @Post('/check-otp-by-mobile')
    @HttpCode(HttpStatus.OK)
    async checkOtpMobileNumber(@Body() payload: RegisterByMobileDto): Promise<any> {
        const result = await this.authService.checkOtpByMobileNumber(payload);
        const message = result ? 'The OTP Code is verified' : 'The OTP Code can not be verified';
        return { message: message, data: result };
    }

    /**
     * Register guest by mobile number
     * @param payload
     * See the [definition of the RegisterByMobileDto file]{@link RegisterByMobileDto} to see a list of required properties
     * @returns a promise with the token result
     */
    @Post('/register-by-mobile-number')
    @HttpCode(HttpStatus.OK)
    async registerMobileNumber(@Body() payload: RegisterByMobileDto): Promise<any> {
        const result = await this.authService.registerByMobileNumber(payload);
        const message = 'Registration Successful';
        return { message: message, data: result };
    }

    /**
     * Login guest by mobile number
     * @param payload
     * See the [definition of the AuthMobileNumberLoginDto file]{@link AuthMobileNumberLoginDto} to see a list of required properties
     * @returns a promise with the token result
     */
    @Post('/login-mobile-number')
    @HttpCode(HttpStatus.OK)
    async loginByMobileNumber(
        @Body() loginDto: AuthMobileNumberLoginDto,
    ): Promise<ResponseResultType<LoginResponseType>> {
        const result = await this.authService.loginByMobileNumber(loginDto);
        return { data: result };
    }
}
