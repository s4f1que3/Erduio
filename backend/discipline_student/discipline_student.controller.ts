import { Controller, Get, Post, Req, Body, Param, UseGuards, Delete, UseInterceptors } from "@nestjs/common";
import { Request } from "express";
import { disciplineService } from "./discipline_student.service";
import { disciplineDTO } from "./discipline_student.dto";
import { AsGuard } from "../Extra Guards/AS.guard";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { ASTGuard } from "../Extra Guards/AST.guard";
import { ASU_DisciplineGuard } from "../Extra Guards/ASU-discipline.guard";
import { ASTSGuard } from "../Extra Guards/ASTS.guard";
import { resolveSchoolId } from "../overrides/school_id.override";
import { PersonalLogger } from "../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { StudentPersonalAnnouncementLogger} from "../Interceptors/SPA logger Interceptor/SPA.logger.intercetpor";
import { ParentAnnouncementLogger } from "../Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../Interceptors/personal logger interceptor/personal-message-decorator";
import { SPATitle } from "../Interceptors/SPA logger Interceptor/SPATitle";
import { ParentAnnouncementMessage } from "../Interceptors/parent announcement logger interceptor/ParentLogMessage";
import { ParentAnnouncementTitle } from "../Interceptors/parent announcement logger interceptor/ParentLogTitle";
import { ASSPGuard } from "../Extra Guards/ASSP.guard";
import { SPAMessage } from "../Interceptors/SPA logger Interceptor/SPAMessage";

@Controller('discipline')
export class disciplineController {

    constructor (
        private readonly discipline: disciplineService,
        private readonly swap: uuidSwapService
    ){}

    @Post('student/:student_id')
    @UseGuards(ASTGuard)
    @UseInterceptors(PersonalLogger, StudentPersonalAnnouncementLogger, ParentAnnouncementLogger, AdminLogger)
    @AdminLogMessage('disciplined a student')
    @PersonalLogMessage('You disciplined a student')
    @SPATitle('Disciplined')
    @SPAMessage('You were disciplined by a teacher')
    @ParentAnnouncementTitle('Your child was discplined')
    @ParentAnnouncementMessage("Your child was disciplined by a teacher. To see why, click 'my child', then discipline. Please contact the teacher/school for any inquires about this incident.")
    async discplineStudent (@Param('student_id') student_id: string, @Req() req: Request & {user: any}, @Body() dto: disciplineDTO) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.disciplineStudent(school_id, req.user.id, student_id, dto.action, dto.message, dto.date)
    }

    @Post('student/:student_id/:id')
    @UseGuards(ASU_DisciplineGuard())
    @UseInterceptors(PersonalLogger, StudentPersonalAnnouncementLogger, ParentAnnouncementLogger, AdminLogger)
    @AdminLogMessage("updated a student's discipline ")
    @PersonalLogMessage("You updated a student's discipline")
    @SPATitle('Discipline Updated')
    @SPAMessage('Your discipline records were updated by a teacher')
    @ParentAnnouncementTitle("Your child's discpline records were updated")
    @ParentAnnouncementMessage("Your child's discipline records were updated by a teacher. Please contact the teacher/school for any inquires about this incident.")
    async updateDiscplineStudent (@Param('student_id') student_id: string, @Param('id') id: string, @Req() req: Request & {user: any}, @Body() dto: disciplineDTO) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.updateDiscipline(school_id, id, req.user.id, student_id, dto.action, dto.message, dto.date)
    }

    @Delete('student/:student_id/:id')
    @UseGuards(ASU_DisciplineGuard())
    @AdminLogMessage("deleted a student's discipline ") // admin
    @PersonalLogMessage("You deleted a student's discipline") // personal (teacher here)
    @SPATitle('Discipline Updated') // student personal announcement title
    @SPAMessage('Your discipline records were updated by a teacher') // student personal announcement message
    @ParentAnnouncementTitle("Your child's discpline records were updated")
    @ParentAnnouncementMessage("Your child's discipline records were updated by a teacher. Please contact the teacher/school for any inquires about this incident.")
    async deleteDiscpline (@Param('student_id') student_id: string, @Param('id') id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.deleteDiscipline(school_id, id)
    }

    @Get()
    @UseGuards(AsGuard)
    async getALLDisciplines (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.getAllDisciplines(school_id)
    }

    @Get('mine')
    @UseGuards(ASTSGuard)
    async getMyDisciplines (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.getMyDisciplines(school_id, req.user.id)
    }

    @Get('all/:student_id')
    @UseGuards(ASSPGuard())
    async getAllRecordsForStudent (@Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.getStudentDisciplineRecords(school_id, student_id)
    }

    @Get('search-students/:name')
    @UseGuards(ASTGuard)
    async searchStudentsByName (@Param('name') name: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.discipline.searchStudentsByName(school_id, name)
    }


}