import { Controller, Get, Post, Delete, Req, Param, Body, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { fileDTO } from "./file_vault.dto";
import { vaultService } from "./file_vault.service";
import { ASTGuard } from "../Extra Guards/AST.guard";
import { resolveSchoolId } from "../overrides/school_id.override";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { PersonalLogger } from "../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { PersonalLogMessage } from "../Interceptors/personal logger interceptor/personal-message-decorator";
import { UploadsLimiter } from "../rate-limit/uploads.limiter";

@Controller('file-vault')
@UseGuards(ASTGuard)
export class vaultController {

    constructor(
        private readonly vault: vaultService,
        private readonly swap: uuidSwapService

    ){}

    @Post('create')
    @UseGuards(UploadsLimiter)
    @UseInterceptors(FileInterceptor('file'))
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You uploaded a file to your vault')
    async uploadFile (@Req() req: Request & {user: any}, @Body() dto: fileDTO, @UploadedFile() file: any) {
        const school_id = resolveSchoolId(req)
        return await this.vault.uploadFile(school_id, dto.title, dto.description, req.user.id, file)
    }

    @Get('view/:id')
    async getSignedUrl (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.vault.getSignedUrl(school_id, id)
    }

    @Get('dowload/:id')
    async downloadFile (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.vault.downloadFile(school_id, id)
    }

    @Delete('delete/:id')
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You deleted a file from your vault')
    async deleteFile (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.vault.deleteFile(school_id, id)
    }

    @Get('all')
    async getAllFiles (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.vault.getAllFiles(school_id, user_id)
    }

}