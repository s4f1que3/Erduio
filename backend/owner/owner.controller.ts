import { Controller, Get, Post, Patch, UseGuards, UseInterceptors, Body, UploadedFile, Param } from "@nestjs/common";
import { OwnerGuard } from "./owner.guard";
import { ownerService } from "./owner.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { OnwerLogger } from "../Interceptors/owner logger interceptor/owner.interceptor";
import { OwnerMessage } from "../Interceptors/owner logger interceptor/OwnerMessage";
import { createSchoolDTO, updateSchoolDTO } from "./owner.dto";
import { SALLogger } from "../Interceptors/school admin logger interceptor/school_admin.logger.interceptor";
import { SALMessage } from "../Interceptors/school admin logger interceptor/school_admin_message.decorator";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { createSuperAdminDTO } from "../super_admin/super_admin.dto";

@Controller('owner')
@UseGuards(OwnerGuard)
export class ownerController {

    constructor (private readonly owner: ownerService){}

    @Post('create/school')
    @UseInterceptors(FileInterceptor('logo'), OnwerLogger)
    @OwnerMessage('You created a school')
    async createSchool (@Body() dto: createSchoolDTO, @UploadedFile() logo: any) {
        return await this.owner.createSchool(dto.name, dto.phone, dto.address, dto.email, logo)
    }

    @Get('schools')
    async getAllSchools () {
        return await this.owner.getSchools()
    }

    @Patch('school/:school_id/edit')
    @UseInterceptors(OnwerLogger, SALLogger)
    @OwnerMessage("You edited a school's info")
    @SALMessage("Your school info was edited by the platform's owner")
    async editSchool (@Body() dto: updateSchoolDTO, @Param('school_id') school_id: string) {
        return await this.owner.editSchool(school_id, dto.address, dto.phone, dto.name, dto.email)
    }

    @Get('school/:school_id/logo')
    async getSignedUrl (@Param('school_id') school_id: string) {
        return await this.owner.getSignedUrl(school_id)
    }

    @Patch('school/:school_id/disable')
    @UseInterceptors(OnwerLogger)
    @OwnerMessage('You disabled a school')
    async disableSchool (@Param('school_id') school_id: string) {
        return await this.owner.disableSchool(school_id)
    }

    @Patch('school/:school_id/enable')
    @UseInterceptors(OnwerLogger)
    @OwnerMessage('You disabled a school')
    async EnableSchool (@Param('school_id') school_id: string) {
        return await this.owner.enableSchool(school_id)
    }



    /// admins
    @Post('school/:school_id/create/super-admin')
    @UseGuards(OwnerGuard)
    @UseInterceptors(OnwerLogger, AdminLogger)
    @OwnerMessage('You created a new super admin')
    @AdminLogMessage('The platform owner created a new super admin for this school')
    async createSuperAdmin (@Param('school_id') school_id: string, @Body() dto: createSuperAdminDTO) {
        return await this.owner.createSuperAdmin(dto.name, dto.email, dto.password, dto.phone, school_id)
    }

    @Patch('school/:school_id/delete/super-admin/:id')
    @UseGuards(OwnerGuard)
    @UseInterceptors(OnwerLogger, AdminLogger)
    @OwnerMessage('You deleted a super admin')
    @AdminLogMessage('The platform owner deleted a super admin for this school')
    async deleteSuperAdmin (@Param('school_id') school_id: string, @Param('id') id: string) {
        return await this.owner.deleteSuperAdmin(school_id, id)
    }

    @Patch('school/:school_id/restore/super-admin/:id')
    @UseGuards(OwnerGuard)
    @UseInterceptors(OnwerLogger, AdminLogger)
    @OwnerMessage('You restored a super admin')
    @AdminLogMessage('The platform owner restore a super admin for this school')
    async restoreSuperAdmin (@Param('school_id') school_id: string, @Param('id') id: string) {
        return await this.owner.restoreSuperAdmin(school_id, id)
    }

    @Get('school/:school_id/active-supers')
    @UseGuards(OwnerGuard)
    async activeSuperAdmins (@Param('school_id') school_id: string) {
        return await this.owner.getActiveSuperAdmins(school_id)
    }

    @Get('school/:school_id/inactive-supers')
    @UseGuards(OwnerGuard)
    async InactiveSuperAdmins (@Param('school_id') school_id: string) {
        return await this.owner.getInactiveSuperAdmins(school_id)
    }










    @Get('logs')
    async getOnwerLogs () {
        return await this.owner.fetchLogs()
    }
}