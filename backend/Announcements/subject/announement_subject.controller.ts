import { announcementsSubjectService } from "./announcement_subject.service";
import { subjectAnnouncementDTO } from "./announcement_subject.dto";
import { Controller, Get, Delete, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { AsGuard } from "Extra Guards/AS.guard";
import { TeacherSubjectGuard } from "assignments/teacher-subject.guard";
import { AST_SubjectGuard } from "Extra Guards/AST-Subject";
import { resolveSchoolId } from "overrides/school_id.override";
import { ASTS_SubjectGuard } from "Extra Guards/ASTS-Subjects.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor/personal-message-decorator";

@Controller('announcements')
export class SubjectAnnouncementsController {
    constructor(
        private readonly announcement: announcementsSubjectService,
        private readonly swap: uuidSwapService
    ){}

    @Post('create/subject/:id')
    @UseGuards(TeacherSubjectGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('created a subject announcement')
    @PersonalLogMessage('You created a subject announcement')
    @UseInterceptors(FileInterceptor('file'))
    async CreateAnnouncement(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: subjectAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.announcement.createSubjectAnnouncement(school_id, dto.title, dto.content, id, user_id, file)
    }

    @Delete('delete/announcement/:announcement_id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted a subject announcement')
    @PersonalLogMessage('You deleted a subject announcement')
    async deleteAnnouncement (@Param('announcement_id') announcement_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.deleteSubjectAnnouncement(school_id, announcement_id)
    }

    @Get('all/subjects')
    @UseGuards(AsGuard)
    async getAllSubjectAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getAll(school_id)
    }
    
    @Get('view:id')
    @UseGuards(ASTS_SubjectGuard())
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getSignedUrl(school_id, id)
    }

    @Get('all/subject/:subject_id')
    @UseGuards(ASTS_SubjectGuard())
    async getAllAnnouncementsForSubject(@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getAllForSubject(school_id, subject_id)
    } 
    
}