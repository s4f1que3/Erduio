import { Controller, Req, Patch, Get, Body, Param, UseGuards, Post, UseInterceptors, UploadedFile, UploadedFiles } from "@nestjs/common"
import { superAdminService } from "./super_admin.service"
import { FileInterceptor } from "@nestjs/platform-express"
import { Super_AdminGuard } from "./super_admin.guard"
import { resolveSchoolId } from "../overrides/school_id.override";
import { UpdateSuperAdminInfoPersonalDTO, UpdateSuperAdminEmailPersonalDTO, UpdateSuperAdminPasswordPersonalDTO } from "./super_admin.dto"
import { uuidSwapService } from "../pipes/transformuuid.pipe"
import { GlobalGuard } from "../Extra Guards/global.guard"
import { emailingService } from "../emailing/emailing.service";

@Controller('super')
    export class superAdminController {
        constructor (
            private readonly superAdmin: superAdminService,
            private readonly swap: uuidSwapService,
            private readonly email: emailingService
        ){}

    ///// PERSONAL SUPER ADMIN
    @Patch('super/update-info/')
    @UseGuards(Super_AdminGuard)
    async updateSuperAdminInfo(@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateSuperAdminInfoPersonalDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.superAdmin.changeSuperAdminInfo(school_id, user_id, dto.new_phone, dto.new_name)
    }
    
    @Patch('super/update-email')
    @UseGuards(Super_AdminGuard)
    async updateSuperAdminEmail (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateSuperAdminEmailPersonalDTO) {
        const school_id = resolveSchoolId(req)
        return await this.superAdmin.changeSuperAdminEmail(school_id, req.user.id, req.user.email, dto.new_email, dto.token)
    }

    @Patch('super/update-password')
    @UseGuards(Super_AdminGuard)
    async updateSuperAdminPassword (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateSuperAdminPasswordPersonalDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        await this.email.sendEmailToUser(`Your password was just changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}.`, 'Info changed!', school_id, {user_id: user_id})
        return await this.superAdmin.changeSuperAdminPassword(req.user.id, req.user.email, dto.current_password, dto.new_password)
    }

    @Post('profile-pic/add')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(FileInterceptor('pfp'))
    async addProfilePic (@Req() req: Request & {user: any, school_id: string}, @UploadedFile() pfp: any) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.superAdmin.addProfilePicture(school_id, user_id, pfp)
    }

    @Get('profile-pic/:user_id')
    @UseGuards(GlobalGuard)
    async showProfilePic (@Req() req: Request & {user: any}, @Param('user_id') user_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.superAdmin.showProfilePicture(school_id, user_id)
    }

    @Get('me/profile')
    @UseGuards(Super_AdminGuard)
    async getMyProfile (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.superAdmin.getSuperAdminProfile(school_id, id)
    }

    @Post('profile-pic/delete')
    @UseGuards(Super_AdminGuard)
    async deleteProfilePic (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.superAdmin.deleteProfilePicture(school_id, user_id)
    }
}