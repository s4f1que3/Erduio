import { announcementsGeneralService } from "./announcements_general.service";
import { GenAnnouncementDTO } from "./announcements_general.dto";
import { Controller, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { AsGuard } from "../../Extra Guards/AS.guard";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";

@Controller('emails/general')
export class announcementsGeneralController {
    constructor(
        private readonly announcement: announcementsGeneralService,
    ){}

    @Post('create')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('sent a school wide email')
    @PersonalLogMessage('You sent a school wide email')
    @UseInterceptors(FileInterceptor('file'))
    async CreateAnnouncement(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: GenAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.createGeneralAnnouncement(school_id, dto.title, dto.content, file)
    }

}