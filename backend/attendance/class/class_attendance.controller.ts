import { Controller, Post, Get, UseGuards, Param, Req, Body } from "@nestjs/common";
import { classAttendanceService } from "./class_attendance.service";
import { classAttendanceDTO } from "./class_attendance.dto";
import { LoggingService } from "../../logging services/logging.service";
import { uuidSwapService } from "../../pipes/transformuuid.pipe";
import { ASTSP_ClassGuard } from "../../Extra Guards/ASTSP-Class.guard";
import { UseInterceptors } from "@nestjs/common";
import { AST_CLASSGuard } from "../../Extra Guards/AST-Class";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { PersonalLogger } from "../../Interceptors/personal logger interceptor/personal.logger.interceptor";
import { PersonalLogMessage } from "../../Interceptors/personal logger interceptor/personal-message-decorator";

@Controller('attendance')
export class classAttendanceController {

    constructor(
        private readonly attendance: classAttendanceService,
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService
    ){}

    @Post('take/class/:class_id')
    @UseGuards(AST_CLASSGuard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You took attendance for a class today')
    async takeAttendance (@Req() req: Request & {user: any}, @Param('class_id') class_id: string, @Body() dto: classAttendanceDTO) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.attendance.takeAttendance(school_id, class_id, dto.date, user_id, dto.records)
    }

    @Get('all/class/:class_id')
    @UseGuards(AST_CLASSGuard())
    async getAllForAClass (@Req() req: Request & {user: any}, @Param('class_id') class_id: string,) {
        const school_id = resolveSchoolId(req)
        return await this.attendance.getAllAttendancesForAClass(school_id, class_id)
    }

    @Get('all/class/:class_id/:date')
    @UseGuards(AST_CLASSGuard())
    async getAllForAClassForADate (@Req() req: Request & {user: any}, @Param('class_id') class_id: string, @Param('date') date: string) {
        const school_id = resolveSchoolId(req)
        return await this.attendance.getClassAttendancesForAClassForADate(school_id, class_id, date)
    }

    @Get('average/class/:class_id/:student_id/')
    @UseGuards(ASTSP_ClassGuard())
    async getStudentAttendanceAverage(@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('class_id') class_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.attendance.getStudentAverage(school_id, student_id, class_id)
    }
}