import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth.dto';
import { ResponseResultType } from '@common/types/response-result.type';
import { LoginResponseType } from './types/login-response.type';

/**
 * Admin side authentication controller
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
     * Login admin side user with his email
     * @param loginDto
     * See the [definition of the AuthEmailLoginDto file]{@link AuthEmailLoginDto} to see a list of required properties
     * @returns a promise with the jwt token
     */
    @Post('login/email')
    @HttpCode(HttpStatus.OK)
    public async login(@Body() loginDto: AuthEmailLoginDto): Promise<ResponseResultType<LoginResponseType>> {
        const loginResult = await this.authService.validateLogin(loginDto);
        return { data: loginResult };
    }
}
