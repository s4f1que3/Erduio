import { personalAnnouncementDTO } from "./announcements_personal.dto";
import { Controller, Get, Delete, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { AsGuard } from "../../Extra Guards/AS.guard";
import { GlobalGuard } from "../../Extra Guards/global.guard";
import { ASTGuard } from "../../Extra Guards/AST.guard";
import { ASTSGuard } from "../../Extra Guards/ASTS.guard";
import { uuidSwapService } from "../../pipes/transformuuid.pipe";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";
import { announcementsPersonalService } from "./announcements_personal.service";

@Controller('announcement')
export class announcementsPersonalController {
    constructor(
        private readonly announcement: announcementsPersonalService,
        private readonly swap: uuidSwapService

    ){}

    @Post('create/student/:id')
    @UseGuards(ASTGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('created a student anouncement')
    @PersonalLogMessage('You created a student announcement')
    @UseInterceptors(FileInterceptor('file'))
    async CreateStudentAnnouncement(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: personalAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        return await this.announcement.createPersonalAnnouncement(school_id, dto.title, auth_id, dto.content, file)
    }

    @Delete('admin/delete/announcement/:announcement_id/student/:id')
    @UseGuards(ASTGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted a student announcement')
    @PersonalLogMessage('You deleted a student announcement')
    async deletePersonalAnnouncement (@Param('id') id: string, @Param('announcement_id') announcement_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.deletePersonalAnnouncement(school_id, announcement_id)
    }

    @Get('all')
    @UseGuards(GlobalGuard)
    async getAll (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getAllPersonalAnnouncementsEver(school_id)
    }

    @Get('view:id')
    @UseGuards(ASTSGuard)
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getSignedUrl(school_id, id)
    } 

    @Get('all/student/:id')
    @UseGuards(AsGuard)
    async getAllPersonalForPerson (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getAllPersonalForPerson(school_id, id)
    }

}