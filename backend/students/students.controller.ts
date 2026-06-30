import { Controller, Get, Post, Patch, UseGuards, Req, Body, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { studentService } from "./students.service";
import {
    CreateStudentWithNewParentDTO,
    CreateStudentWithExistingParentDTO,
    UpdateStudentEnrollmentStatusDTO,
    AdminUpdateStudentInfoDTO,
    AdminUpdateStudentEmailDTO,
    AdminUpdateStudentPasswordDTO,
    UpdateStudentClassDTO,
    UpdateStudentSubjectsDTO,
    UpdateStudentEmailPersonalDTO,
    UpdateStudentPasswordPersonalDTO,
    UpdateStudentPhoneDTO,
} from "./students.dto";
import { StudentGuard } from "students/student.guard";
import { LoggingService } from "logging services/logging.service";
import { Request } from "express";
import { StudentClassGuard } from "./student-class.guard";
import { resolveSchoolId } from "overrides/school_id.override";
import { AsGuard } from "Extra Guards/AS.guard";
import { GlobalGuard } from "Extra Guards/global.guard";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor/personal-message-decorator";
import { StudentLogger } from "Interceptors/student logger interceptor interceptor/student.logger.interceptor";
import { StudentLogMessage } from "Interceptors/student logger interceptor interceptor/StudentMessage";

@Controller('student')
export class StudentController {

    constructor(
        private readonly student: studentService, 
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService
    ){}

    ///// CRUD STUDENTS - ADMINS
    @Post('admin/create')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('created a new student and their parent')
    @PersonalLogMessage('You created a new student and their parent')
    async createStudentWitNewParent (@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: CreateStudentWithNewParentDTO) {
        const school_id = resolveSchoolId(req)
        return await this.student.createStudentWithNewParent(dto.parent_name, dto.parent_phone, dto.student_password, dto.subjects, dto.student_name, dto.classID, school_id, dto.is_creating, dto.student_phone, dto.student_email, dto.parent_email, dto.parent_password)
    }

    @Post('admin/create/add')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('created a new student')
    @PersonalLogMessage('You created a new student')
    async createStudentWitExistingParent(@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: CreateStudentWithExistingParentDTO) {
        const school_id = resolveSchoolId(req)
        return await this.student.createStudentWithExstingParent(dto.student_email, dto.student_password, dto.student_name, school_id, dto.classID, dto.parent_id, dto.subjects, dto.student_phone)
    }

    @Patch('admin/enrollment-status/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage('changed the enrollment status of a student')
    @PersonalLogMessage('You changed the enrollment status of a student')
    @StudentLogMessage('Admin changed your enrollment status')
    async changeEnrollmentStatus(@Body() dto: UpdateStudentEnrollmentStatusDTO, @Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.student.changeStudentEnrollmentStatus(school_id, id, dto.status)
    }


    @Patch('admin/update-email/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage("updated a student's email")
    @PersonalLogMessage("You updated a student's email")
    @StudentLogMessage('Admin updated your email')
    async updateStudentEmail (@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: AdminUpdateStudentEmailDTO, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.student.changeStudentEmail(school_id, id, dto.email)
    }

    @Patch('admin/update-password/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage("updated a student's password")
    @PersonalLogMessage("You updated a student's password")
    @StudentLogMessage('Admin updated your password')
    async updateStudentPassword (@Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: AdminUpdateStudentPasswordDTO, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.student.changeStudentPassowrd(school_id, id, dto.password)
    }

    @Patch('admin/update-info/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage("updated a student's info")
    @PersonalLogMessage("You updated a student's info")
    @StudentLogMessage('Admin updated your info')
    async UpdateStudentInfo (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: AdminUpdateStudentInfoDTO) {
        const school_id = resolveSchoolId(req)
        return await this.student.changeStudentInfo(school_id, id, dto.name, dto.phone)
    }

    @Patch('admin/change-class/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage("changed a student's class")
    @PersonalLogMessage("You changed a student's class")
    @StudentLogMessage('Admin changed your class')
    async changeStudentClass(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: UpdateStudentClassDTO) {
        const school_id = resolveSchoolId(req)
        return await this.student.changeStudentClass(school_id, id, dto.class_id, dto.subjects)
    }

    @Patch('student/add-subjects/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage("changed a student's subjects")
    @PersonalLogMessage("You changed a student's subjects")
    @StudentLogMessage('Admin changed your subjects')
    async UpdateStudentSubjects(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: UpdateStudentSubjectsDTO) {
        const school_id = resolveSchoolId(req)
        return await this.student.addStudentSubjects(school_id, id, dto.subjects)
    }

    @Delete('student/delete-subjects/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @UseInterceptors(StudentLogger)
    @AdminLogMessage("changed a student's subjects")
    @PersonalLogMessage("You deleted a student's subjects")
    @StudentLogMessage('Admin deleted your subjects')
    async DeleteStudentSubjects(@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}, @Body() dto: UpdateStudentSubjectsDTO) {
        const school_id = resolveSchoolId(req)
        return await this.student.deleteStudentSubjects(school_id, id, dto.subjects)
    }

    @Patch('admin/delete/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('deleted a student')
    @PersonalLogMessage('You deleted a student')
    async deleteStudent (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.student.deleteStudent(school_id, id)
    }
    
    @Patch('admin/restore/:id')
    @UseGuards(AsGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('restored a deleted student')
    @PersonalLogMessage('You restored a deleted student')
    async UndodeleteStudent (@Param('id') id: string, @Req() req: Request & {user: any, role: string, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return await this.student.UndoDeleteStudent(school_id, id)
    }

    @Get()
    @UseGuards(GlobalGuard)
    async findAll (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.student.getAllStudents(school_id)
    }

    @Get('/inactive')
    @UseGuards(GlobalGuard)
    async findAllInactive (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.student.getAllInactiveStudents(school_id)
    }

    @Get('profile/:id')
    @UseGuards(AsGuard)
    async getStudentProfile (@Param('id') id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.student.getStudentProfile(school_id, id)
    }

    @Get('me/profile')
    @UseGuards(StudentGuard)
    async getMyProfile (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.student.getStudentProfile(school_id, user_id)
    }

    @Post('admin/:user_id/profile-pic/delete')
    @UseGuards(AsGuard)
    @UseInterceptors(StudentLogger)
    @StudentLogMessage('Admin deleted your profile picture')
    async AdmindeleteProfilePic (@Param('user_id') user_id: string, @Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        return this.student.deleteProfilePicture(school_id, user_id)
    }







    ///// STUDENT PERSONAL UPDATES
    @Patch('update-email')
    @UseGuards(StudentGuard)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You changed your email')
    async updateEmail (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateStudentEmailPersonalDTO) {
        const school_id = resolveSchoolId(req)
        return this.student.updateEmail(school_id, req.user.id, req.user.email, dto.new_email, dto.token)
    }

    @Patch('update-password')
    @UseGuards(StudentGuard)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You changed your password')
    async updatePassword (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateStudentPasswordPersonalDTO) {
        return this.student.updatePassowrd(req.user.id, req.user.email, dto.current_password, dto.new_password)
    }

    @Patch('update-phone')
    @UseGuards(StudentGuard)
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You changed your phone')
    async updatePhone (@Req() req: Request & {user: any, school_id: string}, @Body() dto: UpdateStudentPhoneDTO) {
        const school_id = resolveSchoolId(req)

        const user_id = await this.swap.swapUUID(school_id, req.user.id)

        return this.student.updatePhoneNumber(school_id, user_id, dto.new_phone, dto.token)
    }



    /// profile picture

    @Post('profile-pic/add')
    @UseGuards(StudentGuard)
    @UseInterceptors(FileInterceptor('pfp'))
    async addProfilePic (@Req() req: Request & {user: any, school_id: string}, @UploadedFile() pfp: any) {
        const school_id = resolveSchoolId(req)

        const user_id = await this.swap.swapUUID(school_id, req.user.id)

        return this.student.addProfilePicture(school_id, user_id, pfp)
    }

    @Get('profile-pic/:user_id')
    @UseGuards(GlobalGuard)
    async showProfilePic (@Req() req: Request & {user: any}, @Param('user_id') user_id: string) {
        const school_id = resolveSchoolId(req)
        return await this.student.showProfilePicture(school_id, user_id)
    }
    
    @Post('profile-pic/delete')
    @UseGuards(StudentGuard)
    async deleteProfilePic (@Req() req: Request & {user: any, school_id: string}) {
        const school_id = resolveSchoolId(req)
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return this.student.deleteProfilePicture(school_id, user_id)
    }






    @Get('announcements/general')
    @UseGuards(GlobalGuard)
    async getGeneralAnnouncements(@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.student.fetchGeneralAnnouncements(school_id)
    }

    @Get('announcements/to-me')
    @UseGuards(StudentGuard)
    async getStudentAnnouncements (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)

        const user_id = await this.swap.swapUUID(school_id, req.user.id)

        return await this.student.fetchAllForStudent(school_id, user_id)
    }

    @Get('announcements/class/:id')
    @UseGuards(StudentClassGuard())
    async getClassAnnouncements (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = resolveSchoolId(req)
        return await this.student.fetchForClassStudentIsIn(school_id, id)
    }


    @Get('announcements/students')
    @UseGuards(StudentGuard)
    async getAnnouncementsToStudents (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.student.fetchForStudentGroup(school_id)
    }

    ////logs
    @Get('logs/my-logs')
    @UseGuards(StudentGuard)
    async getPersonalLogs (@Req() req: Request & {user: any}) {
        const school_id = resolveSchoolId(req)
        return await this.logging.getPersonalLogs(school_id, req.user.id)
    }


    
}