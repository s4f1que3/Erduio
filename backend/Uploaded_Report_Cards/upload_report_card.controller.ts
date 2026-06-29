import { uploadReportCardService } from "./upload_report_card.service";
import { uploadReportCardDTO } from "./upload_report_card.dto";
import { Controller, Get, Post, Delete, Req, Body, Param, UseGuards, UseInterceptors, UploadedFile} from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { AsGuard } from "Extra Guards/AS.guard";
import { AST_CLASSGuard } from "Extra Guards/AST-Class";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { ASSP_ReportGuard } from "Extra Guards/ASSP-Report.guard";
import { ASSPGuard } from "Extra Guards/ASSP.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { StudentPersonalAnnouncementLogger} from "Interceptors/SPA logger Interceptor/SPA.logger.intercetpor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";
import { ParentAnnouncementLogger } from "Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { SPATitle } from "Interceptors/SPA logger Interceptor/SPATitle";
import { ParentAnnouncementTitle } from "Interceptors/parent announcement logger interceptor/ParentLogTitle";
import { ParentAnnouncementMessage } from "Interceptors/parent announcement logger interceptor/ParentLogMessage";
import { UploadsLimiter } from "rate-limit/uploads.limiter";
import { SPAMessage } from "Interceptors/SPA logger Interceptor/SPAMessage";

@Controller('report-cards')
export class uploadedReportCardsController {

    constructor(
        private readonly report: uploadReportCardService,
        private readonly swap: uuidSwapService,
    ){}

    @Post('upload/class/:class_id/student/:student_id')
    @UseGuards(UploadsLimiter, AST_CLASSGuard())
    @UseInterceptors(FileInterceptor('file'))
    @UseInterceptors(AdminLogger, StudentPersonalAnnouncementLogger, PersonalLogger, ParentAnnouncementLogger)
    @AdminLogMessage("uploaded a student's report card")
    @PersonalLogMessage("You uploaded a student's report card")
    @SPATitle('Report Card Uploaded!')
    @SPAMessage('Your report card for this term was just uploaded')
    @ParentAnnouncementTitle("Your child's report card!")
    @ParentAnnouncementMessage("Your child's report card for this term was just uploaded. To view it, click 'my child' then report cards.")
    async uploadReportCard (@Param('class_id') class_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @UploadedFile() file: any, @Body() dto: uploadReportCardDTO) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, student_id)
        return await this.report.uploadReportCard(school_id, user_id, class_id, file, dto.title)
    }

    @Get(':student_id/all')
    @UseGuards(ASSPGuard())
    async getAllTheStudentsReportCards(@Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.report.getAllStudentReportCards(school_id, student_id)
    }

    @Get(':student_id/:report_id')
    @UseGuards(ASSP_ReportGuard())
    async viewReportCard(@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('report_id') report_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.report.getSignedUrl(school_id, report_id)
    }

    @Get(':report_id/')
    @UseGuards(ASSP_ReportGuard())
    async downloadReportCard(@Req() req: Request & {user: any}, @Param('report_id') report_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.report.downloadReportCard(school_id, report_id)
    }

    @Get('admin/:student_id/:class_id')
    @UseGuards(AsGuard)
    async getAllTheStudentsReportCardForClass(@Param('student_id') student_id: string, @Param('class_id') class_id: string, @Req() req: Request & {user: any}, @Body() dto: uploadReportCardDTO) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, student_id)
        return await this.report.getStudentReportCardForClass(school_id, user_id, class_id)
    }

    @Delete('/:student_id/:report_id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @UseInterceptors(ParentAnnouncementLogger)
    @AdminLogMessage("deleted a student's report card")
    @PersonalLogMessage("You deleted a student's report card")
    @SPATitle('Report Card Deleted!')
    @SPAMessage('One of your report cards was just deleted. Please contact your teacher/school for information.')
    @ParentAnnouncementTitle("Your child's report card!")
    @ParentAnnouncementMessage("One of your child's report card was just deleted. Please contact the teacher/school for information.")
    async deleteReportCard (@Param('report_id') report_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @Body() dto: uploadReportCardDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.report.deleteReportCard(school_id, report_id)
    }


}