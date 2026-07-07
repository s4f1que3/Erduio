import { Controller, Patch, Get, UseGuards, Req, Body, Post, Param, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { parentService } from "./parent.service";
import { ParentGuard } from "./parent.guard";
import {
    CreateParentLoginDTO,
    AdminUpdateParentInfoDTO,
    AdminUpdateParentPasswordDTO,
    AdminUpdateParentEmailDTO,
    UpdateParentEmailPersonalDTO,
    UpdateParentPasswordPersonalDTO,
    UpdateParentInfoPersonalDTO,
} from "./parent.dto";
import { LoggingService } from "../logging services/logging.service";
import { AsGuard } from "../Extra Guards/AS.guard";
import { resolveSchoolId } from "../overrides/school_id.override";
import { ASTGuard } from "../Extra Guards/AST.guard";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { GlobalGuard } from "../Extra Guards/global.guard";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../Interceptors/personal logger interceptor/personal-message-decorator";
import { ParentPersonalMessage } from "../Interceptors/parent logger interceptor interceptor/ParentMessage";
import { ParentPersonalLogger } from "../Interceptors/parent logger interceptor interceptor/parent.logger.interceptor";
import { emailingService } from "../emailing/emailing.service";

@Controller('parent')
export class ParentController {

    constructor(
        private readonly parent: parentService,
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService,
        private readonly email: emailingService

    ){}

    //// CRUD PARENTS
    @Post('admin/create/login')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('created a new parent login')
    @PersonalLogMessage('You created a new parent login')
    async CreateParentLogin(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: CreateParentLoginDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        await this.email.sendEmailToUser(`Your login account was just created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Your email: ${dto.email}, Password: ${dto.password}. Please note that this password expires 24hrs from now. You MUST! change this to your own password.`, 'Login account created!', school_id, {user_id: user_id})
        return await this.parent.createParentLogin(school_id, dto.email, dto.password)
    }

    @Patch('admin/update-info/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("updated a parent's info")
    @PersonalLogMessage("You updated a parent's info")
    async updateParentInfo(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: AdminUpdateParentInfoDTO) {
        const school_id = resolveSchoolId(req)
        return await this.parent.changeParentInfo(school_id, id, dto.name, dto.phone)
    }

    @Patch('admin/update-password/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("changed a parent's password")
    @PersonalLogMessage("You changed a parent's password")
    async updateParentPassword(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: AdminUpdateParentPasswordDTO) {
        const school_id = resolveSchoolId(req)
        return await this.parent.changeParentPassword(school_id, id, dto.new_password)
    }

    @Patch('admin/update-email/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("changed a parent's email")
    @PersonalLogMessage("You changed a parent's email")
    async updateParentEmail(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: AdminUpdateParentEmailDTO) {
        const school_id = resolveSchoolId(req)
        return await this.parent.changeParentEmail(school_id, id, dto.new_email)
    }

    @Patch('admin/delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("deleted a parent")
    @PersonalLogMessage("You deleted a parent")
    async deleteParent (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.deleteParent(school_id, id)
    }

    @Patch('admin/undo-delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("restored a parent")
    @PersonalLogMessage("You restored a parent")
    async UndoDeleteParent (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.UndoDeleteParent(school_id, id)
    }

    @Get('all/deleted')
    @UseGuards(AsGuard)
    async getDeleted(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.getInactiveParents(school_id)
    }

    @Post('admin/:user_id/profile-pic/delete')
    @UseGuards(AsGuard)
    @UseInterceptors(ParentPersonalLogger)
    @ParentPersonalMessage('Admin deleted your profile picture')
    async SuperAdmindeleteProfilePic (@Param('user_id') user_id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.parent.deleteProfilePicture(school_id, user_id)
    }


    @Get('all-parents')
    @UseGuards(ASTGuard)
    async getAll (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.getParents(school_id)
    }

    @Get('profile/:id')
    @UseGuards(AsGuard)
    async getProfile (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.getParentProfile(school_id, id)
    }









    //// PERSONAL PARENT UPDATES
    @Patch('change-email')@UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You changed your email")
    @UseGuards(ParentGuard)
    async changeEmail (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateParentEmailPersonalDTO) {
        const school_id = resolveSchoolId(req)
        return await this.parent.changeEmail(school_id, req.user.id, req.user.email, dto.new_email, dto.token)
    }

    @Patch('updated-password')
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You changed your password")
    @UseGuards(ParentGuard)
    async changePassword (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateParentPasswordPersonalDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        await this.email.sendEmailToUser(`Your password was just changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}.`, 'Password Changed!', school_id, {user_id: user_id})
        return await this.parent.changePassword(req.user.id, req.user.email, dto.current_password, dto.new_password)
    }

    @Patch('updated-info')
    @UseGuards(ParentGuard)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You changed your info")
    async changeInfo (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateParentInfoPersonalDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.parent.changeInfo(school_id, user_id, dto.new_name, dto.new_phone)
    }

    @Post('profile-pic/add')
    @UseGuards(ParentGuard)
    @UseInterceptors(FileInterceptor('pfp'))
    async addProfilePic (@Req() req: Request & {user: any, school_id: string}, @UploadedFile() pfp: any) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.parent.addProfilePicture(school_id, user_id, pfp)
    }

    @Get('profile-pic/:user_id')
    @UseGuards(GlobalGuard)
    async showProfilePic (@Req() req: Request & {user: any}, @Param('user_id') user_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.parent.showProfilePicture(school_id, user_id)
    }

    @Get('me/profile')
    @UseGuards(ParentGuard)
    async getMyProfile (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.parent.getParentProfile(school_id, user_id)
    }

    @Post('profile-pic/delete')
    @UseGuards(ParentGuard)
    async deleteProfilePic (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.parent.deleteProfilePicture(school_id, user_id)
    }

    @Get('my-kids')
    @UseGuards(ParentGuard)
    async getKidsForParent (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.parent.getMyChild(school_id, user_id)
    }




    //// fetch announcements
    @Get('announcements/general')
    @UseGuards(GlobalGuard)
    async getGeneralAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.fetchGeneralAnnouncements(school_id)
    }

    @Get('announcements/personal')
    @UseGuards(GlobalGuard)
    async getPersonalAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.fetchPersonalAnnouncements(school_id, req.user.id)
    }

    @Get('announcements/parents')
    @UseGuards(ParentGuard)
    async getAnnouncementsToParents (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.parent.fetchForParentGroup(school_id)
    }

    @Get('logs/my-logs')
    @UseGuards(ParentGuard)
    async getPersonalLogs (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.logging.getPersonalLogs(school_id, req.user.id)
    }

    

    

}