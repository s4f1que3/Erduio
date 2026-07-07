import { Injectable, UnauthorizedException, InternalServerErrorException, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"
import { supabaseAdminService } from "../supabaseAdminService/supabase_admin.service"
import { uuidSwapService } from "../pipes/transformuuid.pipe"

@Injectable()
export class authService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly swap: uuidSwapService,
    ){}

    async sendOTP(email: string) {
        const {error} = await this.supabase.db.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: false
            }
        })

        if(error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async refreshSession(refreshToken: string) {
        const {data, error} = await this.supabase.db.auth.refreshSession({ refresh_token: refreshToken})
        if(error || !data.session) throw new UnauthorizedException('Invalid refresh token')
        return data.session
    }

    async verifyOTP(email: string, token: string): Promise<boolean> {
        const {error} = await this.supabase.db.auth.verifyOtp({
            email: email,
            token: token,
            type: 'email'
        })

        if(error) throw new InternalServerErrorException(error.message)
        return true
    }

    async verifyOtpByPhone (phone: string, token: string): Promise <boolean> {
        const {error} = await this.supabase.db.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms'
        })

        if(error) return false
        return true
    }

    async verifyPassword(email: string, password: string) {
        const {error} = await this.supabase.db.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) throw new InternalServerErrorException(error.message)
        return true
    }


    async Login (email: string, password: string) {
        const {data, error} = await this.supabase.db.auth.signInWithPassword({
            email: email,
            password: password
        })

        if(error) throw new InternalServerErrorException(error.message)
        const metadata = data.user?.app_metadata
        console.log('debug: ', JSON.stringify(metadata), 'now:', Date.now())
        if(metadata?.must_change && metadata?.time_end && Date.now() > metadata?.time_end) {
            throw new ForbiddenException('Your temporary password has expired. Please contact school admin for a password change.')
        }

        return data
    }

    async LogOut () {
        const {error} = await this.supabase.db.auth.signOut({
            scope: 'local'
        })
        if(error) throw new InternalServerErrorException(error.message)
    }

    async forgotPasswordSendOTP (email: string) {
        try {
            await this.swap.getUserDataByEmail(email)
            await this.sendOTP(email)
        } catch {
            // Stay silent on lookup/send failures so the response never reveals
            // whether this email is registered.
        }
    }

    async forgotPasswordReset (email: string, token: string, new_password: string) {
        const auth_id = await this.swap.getUserDataByEmail(email)
        await this.verifyOTP(email, token)

        const {error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            password: new_password
        })

        if(error) throw new InternalServerErrorException(error.message)
    }
}