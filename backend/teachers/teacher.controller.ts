import { Controller, Get, Patch, Req, Body, UseGuards, Post, Param, UploadedFiles, UseInterceptors, UploadedFile } from "@nestjs/common";
import { Request } from "express";
import { teacherService } from "./teacher.service";
import { TeachersGuard } from "./teacher.guard";
import {
    CreateTeacherDTO,
    AdminUpdateTeacherInfoDTO,
    AdminUpdateTeacherPasswordDTO,
    AdminUpdateTeacherEmailDTO,
    UpdateTeacherEmailPersonalDTO,
    UpdateTeacherPasswordPersonalDTO,
    UpdateTeacherInfoPersonalDTO,
} from "./teacher.dto";
import { LoggingService } from "../logging services/logging.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { resolveSchoolId } from "../overrides/school_id.override";
import { ASTGuard } from "../Extra Guards/AST.guard";
import { GlobalGuard } from "../Extra Guards/global.guard";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { AsGuard } from "../Extra Guards/AS.guard";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../Interceptors/personal logger interceptor/personal-message-decorator";
import { TeacherLogger } from "../Interceptors/teacher logger interceptor interceptor/teacher.logger.interceptor";
import { emailingService } from "emailing/emailing.service";

@Controller('teacher')
export class teacherController {

    constructor(
        private readonly teacher: teacherService,
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService,
        private readonly email: emailingService
    ){}


    ///// CRUD TEACHERS - ADMINS
    @Post('/admin/create')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('created a new student teacher')
    @PersonalLogMessage('You created a new teacher')
    async CreateTeacher(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: CreateTeacherDTO) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.createTeacher(school_id, dto.email, dto.password, dto.name, dto.phone)
    }

    @Patch('admin/update-info/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("updated a teacher's info")
    @PersonalLogMessage("You updated a teacher's info")
    async updateTeacherInfo(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: AdminUpdateTeacherInfoDTO) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.changeTeacherInfo_SuperADMIN(school_id, id, dto.name, dto.phone)
    }

    @Patch('admin/update-password/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("updated a teacher's password")
    @PersonalLogMessage("You updated a teacher's password")
    async updateTeacherPassword(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: AdminUpdateTeacherPasswordDTO) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.changeTeacherPassword_SuperADMIN(school_id, id, dto.new_password)
    }


    @Patch('admin/update-email/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(TeacherLogger)
    @AdminLogMessage("updated a teacher's email")
    @PersonalLogMessage("You updated a teacher's email")
    async updateTeacherEmail(@Req() req: Request & {user: any, role: string, school_id: string}, @Param('id') id: string, @Body() dto: AdminUpdateTeacherEmailDTO) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.changeTeacherEmail_SuperADMIN(school_id, id, dto.new_email)
    }

    @Patch('admin/delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("deleted a teacher")
    @PersonalLogMessage("You deleted a teacher")
    async deleteTeacher (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.deleteTeacher(school_id, id)

    }

    @Patch('admin/restore/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("restored a teacher")
    @PersonalLogMessage("You restored a teacher")
    async UndodeleteTeacher (@Param('id') id: string, @Req() req: Request & {user: any, role: string}) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.UndoDeleteTeacher(school_id, id)
    }

    @Get('admin/inactive')
    @UseGuards(AsGuard)
    async getInactive (@Req() req: Request & {user: any, role: string}) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.getInactive(school_id)
    }


    @Post('admin/:user_id/profile-pic/delete/:path')
    @UseGuards(AsGuard)
    async SuperAdmindeleteProfilePic(@Param('path') path: string, @Param('user_id') user_id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.teacher.AdmindeleteProfilePicture(school_id, path, user_id)
    }








    //// PERSONAL
    @Get('profile/:id')
    @UseGuards(ASTGuard)
    async getTeacherProfile (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.teacher.getTeacherProfile(school_id, id)
    }

    @Get('me/profile')
    @UseGuards(TeachersGuard)
    async getMyProfile (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.teacher.getMyProfile(school_id, req.user.id)
    }


    @Get()
    @UseGuards(GlobalGuard)
    async getAll (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return this.teacher.getTeachers(school_id)
    }

    @Patch('update-email')
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You updated your email")
    @UseGuards(TeachersGuard)
    async updateEmail (@Req() req: Request & {user: any, email: string}, @Body() dto: UpdateTeacherEmailPersonalDTO) {
        const school_id = resolveSchoolId(req)
        return this.teacher.changeEmail(school_id, req.user.id, req.user.email, dto.new_email, dto.token)
    }

    @Patch('update-password')
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You updated your password")
    @UseGuards(TeachersGuard)
    async updatePassword(@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateTeacherPasswordPersonalDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        await this.email.sendEmailToUser(`Your password was just changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}.`, 'Password changed!', school_id, {user_id: user_id})
        return this.teacher.changePassword(req.user.id, req.user.email, dto.current_password, dto.new_password)
    }

    @Patch('update-info')
    @UseGuards(TeachersGuard)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage("You updated your info")
    async getInfo(@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateTeacherInfoPersonalDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.teacher.changeInfo(school_id, user_id, dto.new_name, dto.new_phone)
    }

    @Post('profile-pic/add')
    @UseGuards(TeachersGuard)
    @UseInterceptors(FileInterceptor('pfp'))
    async addProfilePic (@Req() req: Request & {user: any, school_id: string}, @UploadedFile() pfp: any) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.teacher.addProfilePicture(school_id, user_id, pfp)
    }

    @Get('profile-pic/:user_id')
    @UseGuards(GlobalGuard)
    async showProfilePic (@Req() req: Request & {user: any}, @Param('user_id') user_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.showProfilePicture(school_id, user_id)
    }

    @Post('profile-pic/delete')
    @UseGuards(TeachersGuard)
    async deleteProfilePic (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.teacher.deleteProfilePicture(school_id, user_id)
    }



    //// fetch announcements
    @Get('announcements/general')
    @UseGuards(GlobalGuard)
    async getGeneralAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.fetchGeneralAnnouncements(school_id)
    }

    @Get('announcements/teachers')
    @UseGuards(TeachersGuard)
    async getAnnouncementsToTeachers (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.fetchForTeacherGroup(school_id)
    }

    @Get('announcements/personal')
    @UseGuards(TeachersGuard)
    async getPersonalAnnouncements (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.teacher.fetchPersonalAnnouncements(school_id, req.user.id)
    }

    //// get logs
    @Get('logs/all')
    @UseGuards(TeachersGuard)
    async getLogs (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.logging.getPersonalLogs(school_id, req.user.id)
    }
}