import { Controller, Get, Req, UseGuards, Post, UseInterceptors, Delete, UploadedFile, Param, Patch, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { schoolsService } from "./schools.service";
import { Request } from "express";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AsGuard } from "Extra Guards/AS.guard";
import { resolveSchoolId } from "overrides/school_id.override";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor/personal-message-decorator";
import { schoolDTO } from "./schools.dto";

@Controller('schools')
export class schoolsController {

    constructor(private readonly schools: schoolsService){}

    @Get('info')
    @UseGuards(GlobalGuard)
    async getInfo(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.schools.getSchoolInfo(school_id)
    }

    @Post('add-logo')
    @UseGuards(AsGuard)
    @UseInterceptors(FileInterceptor('logo'))
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('uploaded a logo for the school')
    @PersonalLogMessage('You uploaded a logo for the school')
    async uploadLogo (@Req() req: Request & {user: any}, @UploadedFile() logo: any) {
        const school_id = resolveSchoolId(req)
        return await this.schools.uploadLogo(school_id, logo)
    }

    @Patch('update-info')
    @UseGuards(AsGuard)
    @UseInterceptors(FileInterceptor('logo'))
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('updated info for the school')
    @PersonalLogMessage('You uploaded info for the school')
    async updateInfo (@Req() req: Request & {user: any}, @Body() dto: schoolDTO) {
        const school_id = resolveSchoolId(req)
        return await this.schools.editInfo(school_id, dto.address, dto.phone, dto.name, dto.email)
    }

    @Delete('logo')
    @UseGuards(AsGuard)
    @UseInterceptors(FileInterceptor('logo'))
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted the logo for the school')
    @PersonalLogMessage('You deleted the logo for the school')
    async deleteLogo (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.schools.deleteLogo(school_id)
    }

    @Get(':school_id/logo')
    @UseGuards(GlobalGuard)
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('school_id') school_id: string) {
        return await this.schools.getSignedUrl(school_id)
    }


}
