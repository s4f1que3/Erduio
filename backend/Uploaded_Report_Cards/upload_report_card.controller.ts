import { uploadReportCardService } from "./upload_report_card.service";
import { UploadReportCardDTO } from "./upload_report_card.dto";
import { Controller, Get, Post, Delete, Req, Body, Param, UseGuards, UseInterceptors, UploadedFile} from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { AsGuard } from "../Extra Guards/AS.guard";
import { AST_CLASSGuard } from "../Extra Guards/AST-Class";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { ASSP_ReportGuard } from "../Extra Guards/ASSP-Report.guard";
import { ASSPGuard } from "../Extra Guards/ASSP.guard";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "../Interceptors/personal logger interceptor/personal-message-decorator";
import { UploadsLimiter } from "../rate-limit/uploads.limiter";
import { resolveSchoolId } from "../overrides/school_id.override";

@Controller('report-cards')
export class uploadedReportCardsController {

    constructor(
        private readonly report: uploadReportCardService,
        private readonly swap: uuidSwapService,
    ){}

    @Post('upload/class/:class_id/student/:student_id')
    @UseGuards(UploadsLimiter, AST_CLASSGuard())
    @UseInterceptors(FileInterceptor('file'))
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage("uploaded a student's report card")
    @PersonalLogMessage("You uploaded a student's report card")
    async uploadReportCard (@Param('class_id') class_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}, @UploadedFile() file: any, @Body() dto: UploadReportCardDTO) {
        const school_id = resolveSchoolId(req)
        return await this.report.uploadReportCard(school_id, student_id, class_id, file, dto.title)
    }

    @Get(':student_id/all')
    @UseGuards(ASSPGuard())
    async getAllTheStudentsReportCards(@Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.report.getAllStudentReportCards(school_id, student_id)
    }

    @Get(':student_id/:report_id')
    @UseGuards(ASSP_ReportGuard())
    async viewReportCard(@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('report_id') report_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.report.getSignedUrl(school_id, report_id)
    }

    @Get(':report_id/')
    @UseGuards(ASSP_ReportGuard())
    async downloadReportCard(@Req() req: Request & {user: any}, @Param('report_id') report_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.report.downloadReportCard(school_id, report_id)
    }

    @Get('admin/:student_id/:class_id')
    @UseGuards(AsGuard)
    async getAllTheStudentsReportCardForClass(@Param('student_id') student_id: string, @Param('class_id') class_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.report.getStudentReportCardForClass(school_id, student_id, class_id)
    }

    @Delete('/:student_id/:report_id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage("deleted a student's report card")
    @PersonalLogMessage("You deleted a student's report card")
    async deleteReportCard (@Param('report_id') report_id: string, @Param('student_id') student_id: string, @Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.report.deleteReportCard(school_id, report_id)
    }


}