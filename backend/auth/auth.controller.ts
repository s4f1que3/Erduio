import { Controller, UseGuards, HttpCode, Post, Req, Body } from "@nestjs/common";
import { authService } from "./auth.service";
import { Request } from "express";
import { VerifyOtpDTO, VerifyPasswordDTO, LoginDTO, RefreshDTO } from "./global.auth.dto";
import { GlobalGuard } from "../Extra Guards/global.guard";
import { AuthLimiter } from "../rate-limit/auth.limiter";

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
    async verifyOTP (@Req() req: Request & {user: any}, @Body() dto: VerifyOtpDTO) {
        const email = req.user.email
        return await this.auth.verifyOTP(email, dto.token)
    }

    @Post('verify-password')
    @HttpCode(200)
    @UseGuards(GlobalGuard)
    async verifyPassword (@Req() req: Request & {user: any}, @Body() dto: VerifyPasswordDTO) {
        const email = req.user.email
        return await this.auth.verifyPassword(email, dto.password)
    }

    @Post('Signin')
    @HttpCode(200)
    async Login (@Body() body: LoginDTO) {
        return await this.auth.Login(body.email, body.password)
    }

    @Post('refresh')
    @HttpCode(200)
    async Refresh (@Body() body: RefreshDTO) {
        return await this.auth.refreshSession(body.refresh_token)
    }

    @Post('SignOut')
    @HttpCode(200)
    async Logout () {
        return await this.auth.LogOut()
    }
}