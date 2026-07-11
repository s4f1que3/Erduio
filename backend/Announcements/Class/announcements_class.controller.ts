import { announcementsClassService } from "./announcement_class.service";
import { classAnnouncementDTO } from "./announcements_class.dto";
import { Controller, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AST_CLASSGuard } from "../../Extra Guards/AST-Class";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";


@Controller('emails')
export class classAnnouncementsController {
    constructor(
        private readonly announcement: announcementsClassService,
    ){}

    @Post('create/class/:id')
    @UseGuards(AST_CLASSGuard())
    @UseInterceptors(FileInterceptor('file'))
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('sent a class email')
    @PersonalLogMessage('You sent a class email')
    async CreateAnnouncement(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: classAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.createClassAnnouncement(school_id, dto.title, dto.content, id, file)
    }

}
