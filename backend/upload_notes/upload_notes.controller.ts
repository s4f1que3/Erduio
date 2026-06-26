import { Controller, Param, Req, Body, Patch, Post, Get, Delete, UseGuards, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";
import { Request } from "express";
import { uploadNotesService } from "./upload_notes.service";
import { uploadNotesDTO, updateNotesDTO } from "./upload_notes.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { LoggingService } from "logging services/logging.service";
import { announcementsSubjectService } from "Announcements/subject/announcement_subject.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { ASTS_SubjectGuard } from "Extra Guards/ASTS-Subjects.guard";
import { AST_SubjectGuard } from "Extra Guards/AST-Subject";
import { ASTGuard } from "Extra Guards/AST.guard";
import { UploadsLimiter } from "rate-limit/uploads.limiter";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { SALogger } from "Interceptors/subject announcement logger interceptor/SA.interceptor";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";
import { SATitle } from "Interceptors/subject announcement logger interceptor/SATitle";
import { SAMessage } from "Interceptors/subject announcement logger interceptor/SAMessage";

@Controller('notes')
export class uploadedNotesController {

    constructor(
        private readonly notes: uploadNotesService,
        private readonly logging: LoggingService,
        private readonly announcement: announcementsSubjectService,
        private readonly swap: uuidSwapService
    ){}

    @Post('/:subject_id/create')
    @UseGuards(UploadsLimiter, AST_SubjectGuard())
    @UseInterceptors(FileInterceptor('notes'))
    @UseInterceptors(PersonalLogger, SALogger)
    @PersonalLogMessage('You uploaded some notes')
    @SATitle('New Notes!')
    @SAMessage('Your teacher just uploaded some new notes!')
    async createNote (@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string, @Body() dto: uploadNotesDTO, @UploadedFile() notes?: any) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.notes.uploadNotes(school_id, user_id, subject_id, dto.title, notes, dto.message)

    }

    @Delete('subject/:subject_id/:note_id')
    @UseGuards(AST_SubjectGuard())
    @PersonalLogMessage('You deleted some notes')
    @UseInterceptors(PersonalLogger, SALogger)
    @SATitle('Notes Deleted!')
    @SAMessage('Your teacher just deleted some notes!')
    async deleteNote (@Req() req: Request & {user: any}, @Param('note_id') note_id: string, @Param('subject_id') subject_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.notes.deleteNotes(school_id, note_id)
    }

    @Patch('subject/:subject_id/:note_id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(PersonalLogger, SALogger)
    @PersonalLogMessage('You updated some notes')
    @SATitle('Notes Updated!')
    @SAMessage('Your teacher just updated some notes!')
    async updateNote (@Req() req: Request & {user: any}, @Param('note_id') note_id: string, @Param('subject_id') subject_id: string, @Body() dto: updateNotesDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.notes.updateNote(school_id, note_id, dto.title, dto.message)
    }

    @Get('all/subject/:subject_id')
    @UseGuards(ASTS_SubjectGuard())
    async getAllNotesForSubject (@Req() req: Request & {user: any}, @Param('note_id') note_id: string, @Param('subject_id') subject_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.notes.getAllNotesForSubject(school_id, subject_id)
    }

    @Get('all')
    @UseGuards(ASTGuard)
    async getAllNotesForTeacher(@Req() req: Request & {user: any}, @Param('note_id') note_id: string, @Param('subject_id') subject_id: string) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.notes.getAllNotesForTeacher(school_id, user_id)
    }

    @Get(':note_id/:subject_id/view')
    @UseGuards(ASTS_SubjectGuard())
    async viewNote (@Param('note_id') note_id: string, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.notes.viewNote(school_id, note_id)
    }

    @Get(':note_id/download')
    @UseGuards(ASTS_SubjectGuard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You downloaded some notes')
    async downloadNote (@Param('note_id') note_id: string, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.notes.downloadNote(school_id, note_id)
    }

}