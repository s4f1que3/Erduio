import { Controller, Patch, Get, UseGuards, Req, Body, Post, Param, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { parentService } from "./parent.service";
import { ParentGuard } from "parent/parent.guard";
import { updateParentDTO, optionalParentDTO, parentDTO } from "./parent.dto";
import { LoggingService } from "logging services/logging.service";
import { AsGuard } from "Extra Guards/AS.guard";
import { ASTGuard } from "Extra Guards/AST.guard";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";
import { ParentLogger } from "Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { ParentLogMessage } from "Interceptors/parent logger interceptor interceptor/ParentMessage";

@Controller('parent')
export class ParentController {

    constructor(
        private readonly parent: parentService,
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService,

    ){}

    //// CRUD PARENTS
    @Post('admin/create/login')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('created a new parent login')
    @PersonalLogMessage('You created a new parent login')
    async CreateParentLogin(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: parentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.createParentLogin(school_id, dto.email, dto.password)
    }

    @Patch('admin/update-info/:id') 
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(ParentLogger)
    @AdminLogMessage("updated a parent's info")
    @PersonalLogMessage("You updated a parent's info")
    @ParentLogMessage('admin updated your info')
    async updateParentInfo(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: optionalParentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.changeParentInfo(school_id, id, dto.name, dto.phone)
    }

    @Patch('admin/update-password/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(ParentLogger)
    @AdminLogMessage("changed a parent's password")
    @PersonalLogMessage("You changed a parent's password")
    @ParentLogMessage('admin updated your password')
    async updateParentPassword(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: updateParentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.changeParentPassword(school_id, id, dto.new_password)
    }

    @Patch('admin/update-email/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(ParentLogger)
    @AdminLogMessage("changed a parent's email")
    @PersonalLogMessage("You changed a parent's email")
    @ParentLogMessage('admin updated your email')
    async updateParentEmail(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: updateParentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.changeParentEmail(school_id, id, dto.new_email)
    }

    @Patch('admin/delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("deleted a parent")
    @PersonalLogMessage("You deleted a parent")
    async deleteParent (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: parentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.deleteParent(school_id, id)
    }

    @Patch('admin/undo-delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("restored a parent")
    @PersonalLogMessage("You restored a parent")
    async UndoDeleteParent (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.UndoDeleteParent(school_id, id)
    }

    @Get('all/deleted')
    @UseGuards(AsGuard)
    async getDeleted(@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.getInactiveParents(school_id)
    }

    @Post('admin/:user_id/profile-pic/delete')
    @UseGuards(AsGuard)
    @UseInterceptors(ParentLogger)
    @ParentLogMessage('admin deleted your profile picture')
    async SuperAdmindeleteProfilePic (@Param('user_id') user_id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = req.user.app_metadata.school_id
        return this.parent.deleteProfilePicture(school_id, user_id)
    }


    @Get('all-parents')
    @UseGuards(ASTGuard)
    async getAll (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.getParents(school_id)
    }

    @Get('profile/:id')
    @UseGuards(AsGuard)
    async getProfile (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.getParentProfile(school_id, id)
    }









    //// PERSONAL PARENT UPDATES
    @Patch('change-email')@UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You changed your email")
    @UseGuards(ParentGuard)
    async changeEmail (@Req() req: Request & {user: any, school_id: string}, @Body() dto: {new_email: string, token: string}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.changeEmail(school_id, req.user.id, req.user.email, dto.new_email, dto.token)
    }

    @Patch('updated-password')
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You changed your password")
    @UseGuards(ParentGuard)
    async changePassword (@Req() req: Request & {user: any, school_id: string}, @Body() dto: {current_password: string, new_password: string}) {
        return await this.parent.changePassword(req.user.id, req.user.email, dto.current_password, dto.new_password)
    }

    @Patch('updated-info')
    @UseGuards(ParentGuard)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You changed your info")
    async changeInfo (@Req() req: Request & {user: any, school_id: string}, @Body() dto: updateParentDTO) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.parent.changeInfo(school_id, user_id, dto.new_name, dto.new_phone)
    }

    @Post('profile-pic/add')
    @UseGuards(ParentGuard)
    @UseInterceptors(FileInterceptor('pfp'))
    async addProfilePic (@Req() req: Request & {user: any, school_id: string}, @UploadedFile() pfp: any, @Body() dto: parentDTO) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.parent.addProfilePicture(school_id, user_id, pfp)
    }

    @Get('profile-pic/:user_id')
    @UseGuards(GlobalGuard)
    async showProfilePic (@Req() req: Request & {user: any}, @Param('user_id') user_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.showProfilePicture(school_id, user_id)
    }

    @Get('me/profile')
    @UseGuards(ParentGuard)
    async getMyProfile (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.parent.getParentProfile(school_id, user_id)
    }

    @Post('profile-pic/delete')
    @UseGuards(ParentGuard)
    async deleteProfilePic (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.parent.deleteProfilePicture(school_id, user_id)
    }

    @Get('my-kids')
    @UseGuards(ParentGuard)
    async getKidsForParent (@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.parent.getMyChild(school_id, user_id)
    }




    //// fetch announcements
    @Get('announcements/general')
    @UseGuards(GlobalGuard)
    async getGeneralAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.fetchGeneralAnnouncements(school_id)
    }

    @Get('announcements/personal')
    @UseGuards(GlobalGuard)
    async getPersonalAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.fetchPersonalAnnouncements(school_id, req.user.id)
    }

    @Get('announcements/parents')
    @UseGuards(ParentGuard)
    async getAnnouncementsToParents (@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.parent.fetchForParentGroup(school_id)
    }

    @Get('logs/my-logs')
    @UseGuards(ParentGuard)
    async getPersonalLogs (@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.logging.getPersonalLogs(school_id, req.user.id)
    }

    

    

}