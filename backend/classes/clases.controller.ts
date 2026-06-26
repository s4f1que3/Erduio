import {Controller, Get, Body, Req, Post, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Patch, Param, } from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { classesService } from "./classes.service";
import { classesDto, updateClassesDto } from "./classes.dto";
import { AsGuard } from "Extra Guards/AS.guard";
import { GlobalGuard } from "Extra Guards/global.guard";
import { AST_SubjectGuard } from "Extra Guards/AST-Subject";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";

@Controller('classes')
export class classesController {
    constructor(
        private readonly classes: classesService,
    ){}

    @Get()
    @UseGuards(AsGuard)
    async findAll(@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.getClasses(school_id)
    }

    @Get(':class_id/view/timetable')
    @UseGuards(GlobalGuard)
    async viewTable(@Req() req: Request & {user: any}, @Param('class_id') class_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.getSignedUrl(school_id, class_id)
    }

    @Get(':id/info')
    @UseGuards(GlobalGuard)
    async getClassInfo(@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.getClassInfo(school_id, id)
    }

    @Get(':id/subjects')
    @UseGuards(GlobalGuard)
    async getSubjects(@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.getSubjectsForClass(school_id, id)
    }

    @Get(':id/students')
    @UseGuards(GlobalGuard)
    async getStudentsForClass(@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.getStudentsForClass(school_id, id)
    }

    @Get('subjects/:subject_id/students')
    @UseGuards(AST_SubjectGuard())
    async getStudentsForSubject(@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.getStudentsForSubject(school_id, subject_id)
    }

    @Patch('subjects/:subject_id')
    @UseGuards(AsGuard)
    async updateSubject(@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string, @Body() dto: {name?: string, teacher_id?: string}) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.updateSubject(school_id, subject_id, dto.name, dto.teacher_id)
    }




    /////// CRUD CLASSES
    @Post('create')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('created a new class')
    @PersonalLogMessage('You created a new class')
    @UseInterceptors(FileInterceptor('timetable'))
    async CreateClass(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: classesDto, @UploadedFile() timetable: any) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.createClass(school_id, req.body.subjects, dto.name, dto.class_teacher, timetable)
    }

    @Patch('add-subjects/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('added subjects to a class')
    @PersonalLogMessage('You added subjects to aclass')
    async addSubjects (@Req() req: Request & {user: any, school_id: string}, @Body() dto: classesDto, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.addClassSubjects(school_id, id, req.body.subjects)
    }

    @Patch('change/class-teacher/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("changed a class' teacher")
    @PersonalLogMessage("You changed a class' class teacher")
    async changeClassTeacher (@Req() req: Request & {user: any, school_id: string}, @Body() dto: classesDto, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.changeClassTeacher(school_id, id, dto.class_teacher)
    }

    @Post('change-timetable/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("changed a class' timetable")
    @PersonalLogMessage("You changed a class' timetable")
    @UseInterceptors(FileInterceptor('timetable'))
    async changeTimetable(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: classesDto, @UploadedFile() timetable: any) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.changeTimeTableForClass(school_id, id, timetable)
    }

    @Patch('change-name/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("changed a class' name")
    @PersonalLogMessage("You changed a class' name")
    async changeClassName (@Req() req: Request & {user: any, school_id: string}, @Body() dto: classesDto, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.changeClassName(school_id, id, dto.name)
    }

    @Patch('remove/class-teacher/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("removed a class' class teacher")
    @PersonalLogMessage("You removed a class' class teacher")
    async removeClassTeacher (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}, @Body() dto: classesDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.removeClassTeacher(school_id, id)
    }

    @Patch('remove/subjects/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("removed subjects from a class")
    @PersonalLogMessage("You removed subjects from a class")
    async removeSubjectsFromClass (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}, @Body() dto: classesDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.deleteSubjectsFromClass(school_id, id, dto.subjects)
    }

    @Patch('remove/timetable/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("removed a class' timetable")
    @PersonalLogMessage("You removed a class' timetable")
    async removeTimetableFromClass (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}, @Body() dto: updateClassesDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.deleteTimeTableForClass(school_id, id, dto.path)
    }

    @Patch('delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("deleted a class")
    @PersonalLogMessage("You deleted a class")
    async deleteClass (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}, @Body() dto: updateClassesDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.deleteClass(school_id, id)
    }

    @Patch('restore/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("restored a deleted class")
    @PersonalLogMessage("You restored a deleted class")
    async restoreClass (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}, @Body() dto: updateClassesDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.classes.undoDeleteClass(school_id, id)
    }
}