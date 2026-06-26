import { Controller, Post, Get, UseGuards, Param, Req, Body, UseInterceptors, LoggerService } from "@nestjs/common";
import { subjectAttendanceService } from "./subject_attendance.service";
import { subjectAttendanceDTO } from "./subject_attendance.dto";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { AST_SubjectGuard } from "Extra Guards/AST-Subject";
import { ASTSP_ClassGuard } from "Extra Guards/ASTSP-Class.guard";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";
import { SALogger } from "Interceptors/subject announcement logger interceptor/SA.interceptor";
import { SATitle } from "Interceptors/subject announcement logger interceptor/SATitle";
import { SAMessage } from "Interceptors/subject announcement logger interceptor/SAMessage";

@Controller('attendance')
export class subjectAttendanceController {

    constructor(
        private readonly attendance: subjectAttendanceService,
        private readonly swap: uuidSwapService

    ){}

    @Post('take/subject/:subject_id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(PersonalLogger, SALogger)
    @SATitle("Attendance Taken!")
    @SAMessage("Your teacher just took today's attendance")
    @PersonalLogMessage('You took attendance for your class today')
    async takeAttendance (@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string, @Body() dto: subjectAttendanceDTO) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.attendance.takeAttendance(school_id, subject_id, dto.date, user_id, dto.records)
    }

    @Get('all/subject/:subject_id')
    @UseGuards(AST_SubjectGuard())
    async getAllForASubject (@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string,) {
        const school_id = req.user.app_metadata.school_id
        return await this.attendance.getAllAttendancesForASubject(school_id, subject_id)
    }

    @Get('all/subject/:subject_id/:date')
    @UseGuards(AST_SubjectGuard())
    async getAllForASubjectForADate (@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string, @Param('date') date: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.attendance.getSubjectAttendancesForASubjectForADate(school_id, subject_id, date)
    }

    @Get('average/subject/:student_id/')
    @UseGuards(ASTSP_ClassGuard())
    async getStudentAttendanceAverage (@Req() req: Request & {user: any}, @Param('student_id') student_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.attendance.getStudentAverage(school_id, student_id)
    }
}