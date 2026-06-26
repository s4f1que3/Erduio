import { Controller, UseGuards, HttpCode, Post, Req, Body } from "@nestjs/common";
import { authService } from "./auth.service";
import { Request } from "express";
import { authDTO } from "./global.auth.dto";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AuthLimiter } from "rate-limit/auth.limiter";

@Controller('auth')
@UseGuards(AuthLimiter)
export class authController {

    constructor(private readonly auth: authService){}

    @Post('send-otp')
    @HttpCode(200)
    @UseGuards(GlobalGuard)
    async sendOTP (@Req() req: Request & {user: any}) {
        return await this.auth.sendOTP(req.user.email)
    }

    @Post('verify-otp')
    @HttpCode(200)
    @UseGuards(GlobalGuard)
    async verifyOTP (@Req() req: Request & {user: any}, @Body() dto: authDTO) {
        const email = req.user.email
        return await this.auth.verifyOTP(email, dto.token)
    }

    @Post('verify-password')
    @HttpCode(200)
    @UseGuards(GlobalGuard)
    async verifyPassword (@Req() req: Request & {user: any}, @Body() dto: authDTO) {
        const email = req.user.email
        return await this.auth.verifyPassword(email, dto.password)
    }

    @Post('Signin')
    @HttpCode(200)
    async Login (@Body() body: {email: any, password: any}) {
        return await this.auth.Login(body.email, body.password)
    }

    @Post('refresh')
    @HttpCode(200)
    async Refresh (@Body() body: {refresh_token: string}) {
        return await this.auth.refreshSession(body.refresh_token)
    }

    @Post('forgot-password/send-otp')
    @HttpCode(200)
    async forgotPasswordSendOTP (@Body() body: {email: string}) {
        return await this.auth.forgotPasswordSendOTP(body.email)
    }

    @Post('forgot-password/reset')
    @HttpCode(200)
    async forgotPasswordReset (@Body() body: {email: string, token: string, new_password: string}) {
        return await this.auth.forgotPasswordReset(body.email, body.token, body.new_password)
    }

    @Post('SignOut')
    @HttpCode(200)
    async Logout () {
        return await this.auth.LogOut()
    }
}