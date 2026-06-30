import { adminService } from "./admin.service";
import {
    CreateAdminDTO,
    AdminUpdateAdminInfoDTO,
    AdminUpdateAdminPasswordDTO,
    AdminUpdateAdminEmailDTO,
    UpdateAdminEmailPersonalDTO,
    UpdateAdminPasswordPersonalDTO,
    UpdateAdminInfoPersonalDTO,
} from "./admin.dto";
import { Controller, Get, Post, Patch, Body, UseGuards, HttpCode, Req, Param, Delete, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { Super_AdminGuard } from "super_admin/super_admin.guard";
import { LoggingService } from "logging services/logging.service";
import { AsGuard } from "Extra Guards/AS.guard";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogger } from "Interceptors/personal logger interceptor/personal.logger.interceptor";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AdminGuard } from "./admin.guard";
import { resolveSchoolId } from "overrides/school_id.override";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor/personal-message-decorator";

@Controller('admin')
export class adminController {
    constructor (
        private readonly admin: adminService,
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService

    ){}

    @Post('create-admin')
    @UseGuards(Super_AdminGuard)
    @AdminLogMessage('created an admin')
    async createAdmin (@Body() dto: CreateAdminDTO, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.admin.createAdmin(school_id, dto.email, dto.password, dto.name, dto.phone)
    }

    @Get('/all-admins')
    @UseGuards(Super_AdminGuard)
    async findAll (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.admin.getAdmins(school_id)
    }

    @Get('/inactive-admins')
    @UseGuards(Super_AdminGuard)
    async findInactive (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.admin.getInactive(school_id)
    }

    @Patch('updateadmin-info/:id')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('updated an admins info')
    @PersonalLogMessage('Admin updated your info')
    async UpdateAdminInfo (@Param('id') id: string, @Req() req: Request & {user: any}, @Body() dto: AdminUpdateAdminInfoDTO) {
        const school_id = resolveSchoolId(req)
        return await this.admin.changeAdminInfo(school_id, id, dto.new_name, dto.new_phone)
    }

    @Patch('updateadmin-password/:id')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("updated an admin's password")
    @PersonalLogMessage('Admin changed your password')
    async UpdateAdminPasswordInfo (@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: AdminUpdateAdminPasswordDTO, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.admin.changeAdminPassword(school_id, id, dto.new_password)
    }

    @Patch('updateadmin-email/:id')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("changed an admin's email")
    @PersonalLogMessage('Admin changed your email')
    async UpdateAdminLoginInfo (@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: AdminUpdateAdminEmailDTO, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.admin.changeAdminEmail(school_id, id, dto.new_email)
    }

    @Patch('deleteadmin/:id')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted an admin')
    @PersonalLogMessage('You deleted an admin')
    async deleteAdmin (@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.admin.deleteAdmin(school_id, id)
    }

    @Patch('restore-admin/:id')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("restored an admin's account")
    @PersonalLogMessage("You restored an admin's deleted account")
    async UndoDeleteAdmin (@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.admin.UndoDeleteAdmin(school_id, id)
    }

    @Delete('profile-pic/:id/delete')
    @UseGuards(Super_AdminGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("deleted an admin's profile picture")
    @PersonalLogMessage('Admin deleted your profile picture')
    async DeleteAdminPFP (@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.admin.deleteProfilePicture(school_id, id)
    }












    /// PERSONAL ADMIN
    @Patch('change-email')
    @HttpCode(200)
    @UseGuards(AdminGuard)
    @PersonalLogMessage('You changed your email')
    async changeEmail(@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateAdminEmailPersonalDTO) {
        const school_id = resolveSchoolId(req)
        return await this.admin.changeAdminEmail_Personal(school_id, req.user.id, req.user.email, dto.new_email, dto.token)
    }

    @Patch('change-password')
    @HttpCode(200)
    @UseGuards(AdminGuard)
    @PersonalLogMessage('You changed your password')
    async changePassowrd (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateAdminPasswordPersonalDTO) {
        const email = req.user.email
        return await this.admin.changeAdminPassword_Personal(req.user.id, email, dto.current_password, dto.new_password)
    }

    @Patch('update-info')
    @UseGuards(AdminGuard)
    @PersonalLogMessage('You updated your info')
    async updateAdmin (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateAdminInfoPersonalDTO) {
        const school_id = resolveSchoolId(req)
        return await this.admin.changeAdminInfo_Personal(school_id, req.user.id, dto.new_name, dto.new_phone)
    }

    @Post('profile-pic/add')
    @UseGuards(AdminGuard)
    @UseInterceptors(FileInterceptor('pfp'))
    async addProfilePic (@Req() req: Request & {user: any, school_id: string}, @UploadedFile() pfp: any) {
        const school_id = resolveSchoolId(req)
        const id = await this.swap.swapUUID(school_id, req.user.id)
        return this.admin.addProfilePicture(school_id, id, pfp)
    }

    @Delete('profile-pic/delete')
    @UseGuards(AdminGuard)
    @PersonalLogMessage('You deleted your profile picture')
    async deleteProfilePic (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.admin.deleteProfilePicture(school_id, user_id)
    }

    @Get('profile-pic/:user_id')
    @UseGuards(GlobalGuard)
    async showProfilePic (@Req() req: Request & {user: any}, @Param('user_id') user_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.admin.showProfilePicture(school_id, user_id)
    }

    @Get('me/profile')
    @UseGuards(AdminGuard)
    async getMyProfile (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.admin.getAdminProfile(school_id, id)
    }







    


    //// fetch announcements
    @Get('announcements/general')
    async getGeneralAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.admin.fetchGeneralAnnouncements(school_id)
    }

    @Get('announcements/admins')
    @UseGuards(AsGuard)
    async getAnnouncementsToParents (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.admin.fetchForAdminGroup(school_id)
    }

    //// fetch logs
    @Get('logs/all')
    @UseGuards(AsGuard)
    async getAllAdminLogs (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.logging.getAminLogs(school_id)
    }

    @Get('logs/my-logs')
    @UseGuards(AsGuard)
    async getPersonalLogs (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        const id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.logging.getPersonalLogs(school_id, id)
    }
 

}