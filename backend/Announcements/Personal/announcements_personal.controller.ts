import { personalAnnouncementDTO } from "./announcements_personal.dto";
import { Controller, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { ASTGuard } from "../../Extra Guards/AST.guard";
import { uuidSwapService } from "../../pipes/transformuuid.pipe";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";
import { announcementsPersonalService } from "./announcements_personal.service";

@Controller('emails')
export class announcementsPersonalController {
    constructor(
        private readonly announcement: announcementsPersonalService,
        private readonly swap: uuidSwapService

    ){}

    @Post('create/user/:id')
    @UseGuards(ASTGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('sent an email to a user')
    @PersonalLogMessage('You sent an email to a user')
    @UseInterceptors(FileInterceptor('file'))
    async CreateStudentAnnouncement(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: personalAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        return await this.announcement.createPersonalAnnouncement(school_id, dto.title, auth_id, dto.content, file)
    }

}