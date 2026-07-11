import { Controller, UseInterceptors, UseGuards, Req, Get, Post, Patch, Delete, UploadedFile, Param, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { examService } from "./exam.service";
import { CreateExamDTO, UpdateExamDTO } from "./exam.dto";
import { AsGuard } from "../../Extra Guards/AS.guard";
import { ASTGuard } from "../../Extra Guards/AST.guard";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { ASTS_SubjectGuard } from "../../Extra Guards/ASTS-Subjects.guard";
import { AST_Subject_Exam_Guard } from "../../Extra Guards/ATS-Subject-Exam.guard";
import { ASTSGuard } from "../../Extra Guards/ASTS.guard";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";

@Controller('exams')
export class examsController {

    constructor(
        private readonly exams: examService,
    ){}

    /// admin function first
    @Get('admin/all')
    @UseGuards(AsGuard)
    async getAllExams (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.exams.getAllExams(school_id)
    }

    /// regular functions now
    @Post(':subject_id/create')
    @UseGuards(ASTGuard)
    @UseInterceptors(PersonalLogger, FileInterceptor('file'))
    @PersonalLogMessage('You posted an exam')
    async createExam (@Req() req: Request & {user: any}, @UploadedFile() file: any, @Param('subject_id') subject_id: string, @Body() dto: CreateExamDTO) {
        const school_id = resolveSchoolId(req)
        return await this.exams.createExam(school_id, subject_id, dto.name, dto.content, file)
    }

    @Get(':subject_id/all')
    @UseGuards(ASTS_SubjectGuard())
    async getAllExamsForSubject (@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.exams.getAllExamsForSubject(school_id, subject_id)
    }

    @Patch(':exam_id/update')
    @UseGuards(AST_Subject_Exam_Guard())
    @PersonalLogMessage('You updated an exam')
    async updateExam (@Req() req: Request & {user: any}, @Param('exam_id') exam_id: string, @Body() dto: UpdateExamDTO) {
        const school_id = resolveSchoolId(req)
        return await this.exams.updateInfo(school_id, exam_id, dto.new_name, dto.new_content)
    }

    @Delete(':exam_id/delete')
    @UseGuards(AST_Subject_Exam_Guard())
    @PersonalLogMessage('You deleted an exam')
    async deleteExam (@Req() req: Request & {user: any}, @Param('exam_id') exam_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.exams.deleteExam(school_id, exam_id)
    }

    @Get(':exam_id/view')
    @UseGuards(ASTSGuard)
    async viewExamNote (@Req() req: Request & {user: any}, @Param('exam_id') exam_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.exams.viewFile(school_id, exam_id)
    }


}