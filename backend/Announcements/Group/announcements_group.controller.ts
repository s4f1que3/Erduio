import { announcementsGroupService } from "./announcements_group.service";
import { GroupAnnouncementDTO } from "./announcements_group.dto";
import { Controller, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { AsGuard } from "../../Extra Guards/AS.guard";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";

@Controller('emails')
export class groupAnnouncementsController {
    constructor(
        private readonly announcement: announcementsGroupService,
    ){}

    @Post('create/group/:group')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('sent a group email')
    @PersonalLogMessage('You sent a group email')
    @UseInterceptors(FileInterceptor('file'))
    async CreateAnnouncement(@Param('group') group: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: GroupAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.createGroupAnnouncement(school_id, dto.title, group, dto.content, file)
    }
    
}