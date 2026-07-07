import { examGradeService } from "./exam_grade.service";
import { AddExamGradeDTO, UpdateExamGradeDTO } from "./exam_grade.dto";
import { Controller, Get, Post, Delete, UseGuards, Req, Param, Body, Patch, UseInterceptors } from "@nestjs/common";
import { AST_Subject_Exam_Guard } from "../../Extra Guards/ATS-Subject-Exam.guard";
import { ASSPGuard } from "../../Extra Guards/ASSP.guard";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { ASTSP_ExamGuard } from "../../Extra Guards/ASTSP-Exam.guard";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { StudentPersonalAnnouncementLogger} from "../../Interceptors/SPA logger Interceptor/SPA.logger.intercetpor";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";
import { SPATitle } from "../../Interceptors/SPA logger Interceptor/SPATitle";
import { SPAMessage } from "../../Interceptors/SPA logger Interceptor/SPAMessage";
import { ParentAnnouncementLogger } from "../../Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { ParentAnnouncementTitle } from "../../Interceptors/parent announcement logger interceptor/ParentLogTitle";
import { ParentAnnouncementMessage } from "../../Interceptors/parent announcement logger interceptor/ParentLogMessage";
import { emailingService } from "emailing/emailing.service";
import { LoggingService } from "logging services/logging.service";

@Controller('exam')
export class examGradesController {

    constructor(
        private readonly exam: examGradeService,
        private readonly email: emailingService,
        private readonly logging: LoggingService
    ){}

    @Post(':exam_id/student/:student_id/add')
    @UseGuards(AST_Subject_Exam_Guard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You graded a students exam')
    async addGrade (@Param('exam_id') exam_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @Body() dto: AddExamGradeDTO) {
        const school_id = resolveSchoolId(req)
        return await this.exam.giveGrade(school_id, exam_id, student_id, dto.grade, dto.message)

    }

    @Patch(':exam_id/:student_id/:grade_id/update')
    @UseGuards(AST_Subject_Exam_Guard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You updated a students grade for an exam')
    async updateGrade (@Param('grade_id') grade_id: string, @Param('exam_id') exam_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @Body() dto: UpdateExamGradeDTO) {
        const school_id = resolveSchoolId(req)
        const name = await this.logging.getExamName(school_id, exam_id)
        await this.email.sendToStudentAndParent(`Your grade for the exam '${name}' was updated to ${dto.new_grade} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact your teacher for any inquiries.`, 'Exam grade updated!', school_id, student_id)
        
        return await this.exam.updateGrade(school_id, grade_id, dto.new_grade, dto.new_message)
    }

    @Delete(':exam_id/:student_id/:grade_id/delete')
    @UseGuards(AST_Subject_Exam_Guard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You deleted a students exam grade')
    async deleteGrade (@Param('grade_id') grade_id: string, @Param('student_id') student_id: string, @Param('exam_id') exam_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        const name = await this.logging.getExamName(school_id, exam_id)
        await this.email.sendToStudentAndParent(`Your grade for the exam '${name}' was deleted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact your teacher for any inquiries.`, 'Exam grade deleted!', school_id, student_id)
        return await this.exam.deleteGrade(school_id, grade_id)
    }

    @Get(':student_id/all')
    @UseGuards(ASSPGuard())
    async getAllGrades (@Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.exam.getAllStudentsExamGrades(school_id, student_id)
    }

    @Get(':exam_id/:student_id/grade')
    @UseGuards(ASTSP_ExamGuard())
    async getGradeForExam (@Param('exam_id') exam_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.exam.getStudentsExamGradeForExam(school_id, student_id, exam_id)
    }



}