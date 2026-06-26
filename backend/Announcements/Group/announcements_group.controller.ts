import { announcementsGroupService } from "./announcements_group.service";
import { GroupAnnouncementDTO } from "./announcements_group.dto";
import { Controller, Get, Delete, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { AsGuard } from "Extra Guards/AS.guard";
import { ASU_GroupGuard } from "Extra Guards/ASU-group.guard";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";

@Controller('announcements/group')
export class groupAnnouncementsController {
    constructor(
        private readonly announcement: announcementsGroupService,
    ){}

    @Post('create/group/:group')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('created a group announcement')
    @PersonalLogMessage('You created a group announcement')
    @UseInterceptors(FileInterceptor('file'))
    async CreateAnnouncement(@Param('group') group: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: GroupAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.createGroupAnnouncement(school_id, dto.title, group, dto.content, file)
    }

    @Delete('delete/group/:group/announcement/:announcement_id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted a group announcement')
    @PersonalLogMessage('You deleted a group announcement')
    async deleteAnnouncement (@Param('group') group: string, @Param('announcement_id') announcement_id: string, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.deleteGroupAnnouncement(school_id, announcement_id, group)
    }

    @Get('all')
    @UseGuards(AsGuard)
    async getAll (@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.getAllGroupAnnouncements(school_id)
    } 

    @Get('view:id')
    @UseGuards(GlobalGuard)
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.getSignedUrl(school_id, id)
    } 

    @Get('all/group/:group')
    @UseGuards(ASU_GroupGuard())
    async getAllForGroup (@Param('group') group: string, @Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.announcement.getAllForGroup(school_id, group)
    } 
    
}