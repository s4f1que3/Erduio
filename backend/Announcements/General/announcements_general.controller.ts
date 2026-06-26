import { announcementsGeneralService } from "./announcements_general.service";
import { GenAnnouncementDTO } from "./announcements_general.dto";
import { Controller, Get, Delete, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { AsGuard } from "Extra Guards/AS.guard";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";

@Controller('announcements/general')
export class announcementsGeneralController {
    constructor(
        private readonly announcement: announcementsGeneralService,
    ){}

    @Post('admin/create')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('created a general announcement')
    @PersonalLogMessage('You created a general announcement')
    @UseInterceptors(FileInterceptor('file'))
    async CreateAnnouncement(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: GenAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.createGeneralAnnouncement(school_id, dto.title, dto.content, file)
    }

    @Delete('admin/delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted a general announcement')
    @PersonalLogMessage('You deleted a general announcement')
    async deleteAnnouncement (@Param('id') id: string, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.deleteGeneralAnnouncement(school_id, id)
    }

    @Get('all')
    @UseGuards(GlobalGuard)
    async getAll (@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.getAll(school_id)
    }

    @Get('view:id')
    @UseGuards(GlobalGuard)
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.getSignedUrl(school_id, id)
    } 

}