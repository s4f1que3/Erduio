import { announcementsClassService } from "./announcement_class.service";
import { classAnnouncementDTO } from "./announcements_class.dto";
import { Controller, Get, Delete, Param, Req, Post, UseGuards, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { AsGuard } from "../../Extra Guards/AS.guard";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { AST_CLASSGuard } from "../../Extra Guards/AST-Class";
import { ASTS_ClassGuard } from "../../Extra Guards/ASTS-Class";
import { AdminLogger } from "../../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";
import { CALogger } from "../../Interceptors/Class Announcement logger Interceptor/CA.interceptor";
import { CATitle } from "../../Interceptors/Class Announcement logger Interceptor/CATitle";
import { CAMessage } from "../../Interceptors/Class Announcement logger Interceptor/CAMessage";

@Controller('announcements')
export class classAnnouncementsController {
    constructor(
        private readonly announcement: announcementsClassService,
    ){}

    @Post('create/class/:id')
    @UseGuards(AST_CLASSGuard())
    @UseInterceptors(FileInterceptor('file'))
    @UseInterceptors(AdminLogger, PersonalLogger, CALogger)
    @AdminLogMessage('created a class announcement')
    @PersonalLogMessage('You created a class announcement')
    @CATitle('New Announcement!')
    @CAMessage('Your teacher just created a new class announcement')
    async CreateAnnouncement(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: classAnnouncementDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.createClassAnnouncement(school_id, dto.title, dto.content, id, file)
    }

    @Delete('delete/class/:class_id/announcement/:announcement_id')
    @UseGuards(AST_CLASSGuard())
    @UseInterceptors(AdminLogger, PersonalLogger, CALogger)
    @AdminLogMessage('deleted a class announcement')
    @PersonalLogMessage('You deleted a class announcement')
    @CATitle('Announcement Deleted!')
    @CAMessage('Your teacher just deleted a class announcement')
    async deleteAnnouncement (@Param('class_id') class_id: string, @Param('announcement_id') announcement_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.deleteClassAnnouncement(school_id, announcement_id)
    }

    @Get('view:id')
    @UseGuards(ASTS_ClassGuard())
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getSignedURL(school_id, id)
    } 

    @Get('all/classes/')
    @UseGuards(AsGuard)
    async getAll (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getAll(school_id)
    } 

    @Get('all/class/:id')
    @UseGuards(ASTS_ClassGuard())
    async getAllForClass (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.announcement.getAllForClass(school_id, id)
    } 

    
}
