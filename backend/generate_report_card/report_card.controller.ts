import { Controller, Post, Get, Patch, UseGuards, Param, Req, Body, UseInterceptors } from "@nestjs/common";
import { ReportCardService } from "./report_card.service";
import { SubmitGradesDTO, SubmitStudentGradesDTO } from "./report_card.dto";
import { AsGuard } from "../Extra Guards/AS.guard";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { AST_SubjectGuard } from "../Extra Guards/AST-Subject";
import { AST_CLASSGuard } from "../Extra Guards/AST-Class";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../Interceptors/personal logger interceptor/personal-message-decorator";
import { ASTGuard } from "../Extra Guards/AST.guard";
import { resolveSchoolId } from "../overrides/school_id.override";
import { ParentAnnouncementLogger } from "../Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { StudentPersonalAnnouncementLogger} from "../Interceptors/SPA logger Interceptor/SPA.logger.intercetpor";
import { SPATitle } from "../Interceptors/SPA logger Interceptor/SPATitle";
import { SPAMessage } from "../Interceptors/SPA logger Interceptor/SPAMessage";
import { ParentAnnouncementTitle } from "../Interceptors/parent announcement logger interceptor/ParentLogTitle";
import { ParentAnnouncementMessage} from "../Interceptors/parent announcement logger interceptor/ParentLogMessage";
import { ReportCardGenerationLimiter } from "../rate-limit/report-card-generation.limiter";

//// this whole folder was ai generated because i was tired at this point in time.
// it was late at night. so read this code with a grain of salt

@Controller('report-card')
export class ReportCardController {
    constructor(
        private readonly reportCard: ReportCardService,
        private readonly swap: uuidSwapService,
    ) {}

    @Post('grades/subject/:class_subject_id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('submitted grades for this term.')
    @PersonalLogMessage('You submitted grades for this term')
    async submitGrades(@Req() req: Request & { user: any }, @Param('class_subject_id') class_subject_id: string, @Body() dto: SubmitGradesDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.reportCard.submitGrades(school_id, class_subject_id, user_id, dto.term, dto.records)
    }

    @Get('grades-status/:term')
    @UseGuards(ASTGuard)
    async getGradesStatus(@Req() req: Request & { user: any }, @Param('term') term: string) {
        const school_id = resolveSchoolId(req)
        const is_open = await this.reportCard.isGradesEndpointOpen(school_id, parseInt(term))
        return { is_open }
    }

    @Patch('grades-status/:term')
    @UseGuards(AsGuard)
    async setGradesStatus(@Req() req: Request & { user: any }, @Param('term') term: string, @Body() dto: { is_open: boolean }) {
        const school_id = resolveSchoolId(req)
        return await this.reportCard.setGradesEndpointStatus(school_id, parseInt(term), dto.is_open)
    }

    @Get('student/:student_id/term/:term')
    @UseGuards(AsGuard)
    async getReportCard(@Req() req: Request & { user: any }, @Param('student_id') student_id: string, @Param('term') term: string) {
        const school_id = resolveSchoolId(req)
        return await this.reportCard.getReportCard(school_id, student_id, parseInt(term))
    }

    @Post('send/student/:student_id/term/:term')
    @UseGuards(AsGuard)
    @UseInterceptors(PersonalLogger, AdminLogger)
    @AdminLogMessage('just uploaded a students report card for this term.')
    @PersonalLogMessage('You uploaded a students report card for this term.')
    async sendReportCard(@Req() req: Request & { user: any }, @Param('student_id') student_id: string, @Param('term') term: string) {
        const school_id = resolveSchoolId(req)
        return await this.reportCard.sendReportCard(school_id, student_id, parseInt(term))
    }

    @Get('grades/class/:class_id/student/:student_id/term/:term')
    @UseGuards(AST_CLASSGuard())
    async getStudentGradeSheet(@Req() req: Request & { user: any }, @Param('class_id') class_id: string, @Param('student_id') student_id: string, @Param('term') term: string) {
        const school_id = resolveSchoolId(req)
        return await this.reportCard.getStudentGradeSheet(school_id, class_id, student_id, parseInt(term))
    }

    @Post('grades/class/:class_id/student/:student_id')
    @UseGuards(AST_CLASSGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("entered a student's grades for this term")
    @PersonalLogMessage("You entered a student's grades for this term")
    async submitStudentGrades(@Req() req: Request & { user: any }, @Param('class_id') class_id: string, @Param('student_id') student_id: string, @Body() dto: SubmitStudentGradesDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.reportCard.submitStudentGrades(school_id, student_id, user_id, dto.term, dto.records)
    }

    @Get('class/:class_id/term/:term/completion')
    @UseGuards(AST_CLASSGuard())
    async getClassCompletion(@Req() req: Request & { user: any }, @Param('class_id') class_id: string, @Param('term') term: string) {
        const school_id = resolveSchoolId(req)
        return await this.reportCard.getClassCompletion(school_id, class_id, parseInt(term))
    }

    @Post('generate/class/:class_id/term/:term')
    @UseGuards(ReportCardGenerationLimiter, AST_CLASSGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('just generated and sent out report cards for their entire class')
    @PersonalLogMessage('You just generated and sent out report cards for your entire class')
    async generateClassReportCards(@Req() req: Request & { user: any }, @Param('class_id') class_id: string, @Param('term') term: string) {
        const school_id = resolveSchoolId(req)
        return await this.reportCard.generateClassReportCards(school_id, class_id, parseInt(term))
    }
}
