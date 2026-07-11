import { announcementsSubjectService } from "./announcement_subject.service";
import { subjectAnnouncementDTO } from "./announcement_subject.dto";
import { Controller, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";
import { AST_SubjectGuard } from "../../Extra Guards/AST-Subject";

@Controller('emails')
export class SubjectAnnouncementsController {
    constructor(
        private readonly announcement: announcementsSubjectService,
    ){}

    @Post('create/subject/:id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('sent a subject email')
    @PersonalLogMessage('You sent a subject email')
    @UseInterceptors(FileInterceptor('file'))
    async CreateAnnouncement(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: subjectAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.createSubjectAnnouncement(school_id, dto.title, dto.content, id, file)
    }

}