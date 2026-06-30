import { examGradeService } from "./exam_grade.service";
import { AddExamGradeDTO, UpdateExamGradeDTO } from "./exam_grade.dto";
import { Controller, Get, Post, Delete, UseGuards, Req, Param, Body, Patch, UseInterceptors } from "@nestjs/common";
import { AST_Subject_Exam_Guard } from "Extra Guards/ATS-Subject-Exam.guard";
import { ASSPGuard } from "Extra Guards/ASSP.guard";
import { resolveSchoolId } from "overrides/school_id.override";
import { ASTSP_ExamGuard } from "Extra Guards/ASTSP-Exam.guard";
import { PersonalLogger } from "Interceptors/personal logger interceptor/personal.logger.interceptor";
import { StudentPersonalAnnouncementLogger} from "Interceptors/SPA logger Interceptor/SPA.logger.intercetpor";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor/personal-message-decorator";
import { SPATitle } from "Interceptors/SPA logger Interceptor/SPATitle";
import { SPAMessage } from "Interceptors/SPA logger Interceptor/SPAMessage";
import { ParentAnnouncementLogger } from "Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { ParentAnnouncementTitle } from "Interceptors/parent announcement logger interceptor/ParentLogTitle";
import { ParentAnnouncementMessage } from "Interceptors/parent announcement logger interceptor/ParentLogMessage";

@Controller('exam')
export class examGradesController {

    constructor(
        private readonly exam: examGradeService,
    ){}

    @Post(':exam_id/student/:student_id/add')
    @UseGuards(AST_Subject_Exam_Guard())
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @UseInterceptors(ParentAnnouncementLogger)
    @PersonalLogMessage('You graded a students exam')
    @SPATitle('Exam Graded!')
    @SPAMessage('Your teacher just graded your exam!')
    @ParentAnnouncementTitle("Exam Graded!")
    @ParentAnnouncementMessage("Your child just recieved a grade for an exam. To view it, click 'my child' then exams.")
    async addGrade (@Param('exam_id') exam_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @Body() dto: AddExamGradeDTO) {
        const school_id = resolveSchoolId(req)
        return await this.exam.giveGrade(school_id, exam_id, student_id, dto.grade, dto.message)

    }

    @Patch(':exam_id/:student_id/:grade_id/update')
    @UseGuards(AST_Subject_Exam_Guard())
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @UseInterceptors(ParentAnnouncementLogger)
    @PersonalLogMessage('You updated a students grade for an exam')
    @SPATitle('Exam Grad Updated!')
    @SPAMessage('Your teacher just updated your grade for an exam!')
    @ParentAnnouncementTitle("Exam Grade Updated!")
    @ParentAnnouncementMessage("Your child's exam grade was just updated. To view it, click 'my child' then exams. Please contact the teacher/school for any questions about this grade change.")
    async updateGrade (@Param('grade_id') grade_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @Body() dto: UpdateExamGradeDTO) {
        const school_id = resolveSchoolId(req)
        return await this.exam.updateGrade(school_id, grade_id, dto.new_grade, dto.new_message)
    }

    @Delete(':exam_id/:student_id/:grade_id/delete')
    @UseGuards(AST_Subject_Exam_Guard())
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @UseInterceptors(ParentAnnouncementLogger)
    @PersonalLogMessage('You deleted a students exam grade')
    @SPATitle('Exam Grade Deleted!')
    @SPAMessage('Your teacher just deleted your grade for an exam!')
    @ParentAnnouncementTitle("Exam Grade Deleted!")
    @ParentAnnouncementMessage("Your child's exam grade was just deleted. Please contact the teacher/school for any questions about this grade deletion.")
    async deleteGrade (@Param('grade_id') grade_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
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