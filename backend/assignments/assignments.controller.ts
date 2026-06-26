import { assignmentService } from "./assignment.service";
import { assignmentDTO } from "./assignment.dto";
import { LoggingService } from "logging services/logging.service";
import { Controller, Req, Query, Param, Body, UseGuards, UseInterceptors, UploadedFile, Post, Delete, Get, Patch } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { TeacherSubjectGuard } from "./teacher-subject.guard";
import { StudentSubjectGuard} from "./student-subject.guard";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { StudentSubjectGuardForUpload } from "./student-subjectforUpload.guard";
import { StudentSubjectAssignmentGuard } from "./student-subjectForAssignment.guard";
import { AST_SubjectGuard } from "Extra Guards/AST-Subject";
import { AsGuard } from "Extra Guards/AS.guard";
import { AST_AssignmentGuard } from "Extra Guards/AST-Assignment.guard";
import { ASTGuard } from "Extra Guards/AST.guard";
import { AST_Subject_AssignmentGuard } from "Extra Guards/AST-Subject-Assignment.guard";
import { ASSP_Subject_UploadGuard } from "Extra Guards/ASSP-Subject-Upload.guard";
import { ASSPGuard } from "Extra Guards/ASSP.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";
import { SALogger } from "Interceptors/subject announcement logger interceptor/SA.interceptor";
import { SPAMessage } from "Interceptors/SPA logger Interceptor/SPAMessage";
import { SATitle } from "Interceptors/subject announcement logger interceptor/SATitle";
import { StudentPersonalAnnouncementLogger} from "Interceptors/SPA logger Interceptor/SPA.logger.intercetpor";
import { SPATitle } from "Interceptors/SPA logger Interceptor/SPATitle";
import { ParentLogger } from "Interceptors/parent announcement logger interceptor/ParentAnnouncement.logger";
import { ParentMessage } from "Interceptors/parent announcement logger interceptor/ParentLogMessage";
import { ParentTitle } from "Interceptors/parent announcement logger interceptor/ParentLogTitle";
import { TeacherAssignmentGuard } from "./teacher-assignment.guard";
import { SAMessage } from "Interceptors/subject announcement logger interceptor/SAMessage";

@Controller('assignments')
export class assignmentsController {

    constructor(
        private readonly assignments: assignmentService,
        private readonly logging: LoggingService,
        private readonly swap: uuidSwapService,
    ){}

    @Post('create/subject/:subject_id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('created an assignment')
    @PersonalLogMessage('You created a new assignment')
    @UseInterceptors(SALogger)
    @SATitle('New Assignment!')
    @SAMessage('Your teacher just uploaded a new assignment')
    @UseInterceptors(FileInterceptor('file'))
    async createAssignment (@Param('subject_id') subject_id: string, @Req() req: Request & {user: any}, @Body() dto: assignmentDTO, @UploadedFile() file: any) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.assignments.createAssingment(dto.name, school_id, dto.due_date, dto.description, dto.subject_id, user_id, file)
    }

    @Delete('delete/:subject_id/:assignment_id')
    @UseGuards(AST_SubjectGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('deleted an assignment')
    @PersonalLogMessage('You deleted an assignment')
    @UseInterceptors(SALogger)
    @SATitle('Deleted Assignment!')
    @SAMessage('Your teacher just deleted an assignment')
    async deleteAssingment (@Param('subject_id') subject_id: string, @Param('assignment_id') assignment_id: string, @Req() req: Request & {user: any}, @Body() dto : assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.deleteAssignment(school_id, assignment_id)
    }

    @Get(':assignment_id/view')
    @UseGuards(StudentSubjectAssignmentGuard) 
    async viewAssignment (@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string) {
        const school_id = req.user.app_metadata.school_id
        await this.assignments.insertStudentViewedAssignment(school_id, assignment_id, req.user.id)
        return await this.assignments.getSignedUrlForAssignments(school_id, assignment_id)
    }

    @Get('admin/:assignment_id/view')
    @UseGuards(StudentSubjectGuard) 
    async viewAssignmentForNonStudent (@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getSignedUrlForAssignments(school_id, assignment_id)
    }

    @Get('admin/all')
    @UseGuards(AsGuard)
    async getAllAssignmentsForAdmin (
    @Query() filters: {subject_id?: string; teacher_id?: string; status?: string }, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getAllAssignmentsForAdmins(school_id, filters)
    }

    @Get('/:assignment_id/views')
    @UseGuards(AST_AssignmentGuard())
    async getAssignmentViews (@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getAssignmentViews(school_id, assignment_id)
    } 

    @Get('all/:subject_id')
    @UseGuards(StudentSubjectGuard)
    async getAllAssignmentsForSubjects(@Req() req: Request & {user: any}, @Param('subject_id') subject_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getAllAssignmentsForSubject(school_id, subject_id)
    }

    @Get('teacher/all')
    @UseGuards(ASTGuard)
    async getAllAssignmentsForTeacher (
    @Query() filters: {subject_id?: string; teacher_id?: string; status?: string }, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.assignments.getAllAssignmentsForTeachers(school_id, user_id, filters)
    }

    @Get('all/:subject_id')
    @UseGuards(StudentSubjectGuard)
    async getAllSubmissionsForAssignmentsForStudents (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.assignments.getAllAssignmentSubmissionsForStudents(school_id, user_id)
    }

    @Patch('extend/:assignment_id')
    @UseGuards(AST_Subject_AssignmentGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('extended an assignment')
    @PersonalLogMessage('You extended an assignment')
    @UseInterceptors(SALogger)
    @SATitle('Assignment Extended!')
    @SAMessage('Your teacher just extended an assignment')
    async extendAssignment(@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string, @Body() dto: assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.extendAssignment(school_id, assignment_id, dto.due_date)
    }

    @Patch('extend/:assignment_id/student/:student_id')
    @UseGuards(AST_Subject_AssignmentGuard())
    @UseInterceptors(AdminLogger, PersonalLogger)
    @AdminLogMessage('extended an assignment for a student')
    @PersonalLogMessage('You extended an assignment for a student')
    @UseInterceptors(SALogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @SPATitle('Assignment Extended!')
    @SPAMessage('Your teacher just extended an assignment for you')
    async extendAssignmentForStudent (@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string, @Param('student_id') student_id: string, @Body() dto: assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.extendAssignmentForStudent(school_id, assignment_id, dto.due_date, student_id)
    }







    /////asignment grades
    @Post(':assignment_id/add-grade/:student_id')
    @UseGuards(TeacherAssignmentGuard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You graded an assignment for a student')
    @UseInterceptors(SALogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @SPATitle('Assignment Graded!')
    @SPAMessage('Your teacher just graded an assignment for you')
    @UseInterceptors(ParentLogger)
    @ParentTitle("Your child's assignment grade")
    @ParentMessage("You child's assignment grade was just uploaded. Click 'my child' then assignments to see the grade")
    async addStudentGrade (@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('assignment_id') assignment_id: string, @Body() dto: assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        return this.assignments.addStudentGradeForAssignment(school_id, student_id, assignment_id, dto.grade, dto.message)
    }

    @Delete(':assignment_id/delete-grade/:student_id')
    @UseGuards(TeacherSubjectGuard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You deleted an assignment grade for a student')
    @UseInterceptors(SALogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @SPATitle('Assignment Grade Deleted!')
    @SPAMessage('Your teacher just deleted an assignment grade for you')
    @UseInterceptors(ParentLogger)
    @ParentTitle("Your child's assignment grade")
    @ParentMessage("You child's assignment grade was just deleted. Contact the teacher for any inquires.")
    async deleteStudentGrade (@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('assignment_id') assignment_id: string, @Body() dto: assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        return this.assignments.deleteStudentGradeForAssignment(school_id, student_id, assignment_id)
    }

    @Patch(':assignment_id/change-grade/:student_id')
    @UseGuards(TeacherSubjectGuard())
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You changed a grade for an assignment for a student')
    @UseInterceptors(SALogger)
    @UseInterceptors(StudentPersonalAnnouncementLogger)
    @SPATitle('Assignment Grade Changed!')
    @SPAMessage('Your teacher just changed an assignment grade for you')
    @UseInterceptors(ParentLogger)
    @ParentTitle("Your child's assignment grade")
    @ParentMessage("You child's assignment grade was just changed. Contact the teacher for any inquires.")
    async changeStudentGrade (@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('assignment_id') assignment_id: string, @Body() dto: assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        return this.assignments.changeStudentGradeForAssignment(school_id, student_id, assignment_id, dto.grade, dto.message)
    }

    @Get(':assignment_id/my-grade/:student_id')
    @UseGuards(ASSP_Subject_UploadGuard())
    async getAssignmentGrade (@Req() req: Request & {user: any}, @Param('student_id') student_id: string, @Param('assignment_id') assignment_id: string, @Body() dto: assignmentDTO) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, student_id)
        return await this.assignments.getAssignmentGrade(school_id, assignment_id, user_id)
    }

    @Get('all/grades/:student_id')
    @UseGuards(ASSPGuard())
    async getAllStudentAssignmentGrades (@Req() req: Request & {user: any}, @Param('student_id') student_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getAllGradesForStudentAssignmets(school_id, student_id)
    }











    //// submissions
    @Post('student/upload/:assignment_id')
    @UseGuards(StudentSubjectGuardForUpload())
    @UseInterceptors(FileInterceptor('file'))
    @UseInterceptors(PersonalLogger)
    @PersonalLogMessage('You uploaded your submission for an assignment')
    async uploadSubmission (@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string, @UploadedFile() file: any) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        return await this.assignments.uploadSubmission(school_id, assignment_id, user_id, file)
    }

    @Get('submissions/:assignment_id')
    @UseGuards(AST_AssignmentGuard())
    async getSubmissionsForAssignment (@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getSubmissionsForAssignment(school_id, assignment_id)
    }

    @Get(':assignment_id/:student_id/submission/view')
    @UseGuards(AST_AssignmentGuard()) 
    async viewSubmissions(@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string, @Param('student_id') student_id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.assignments.getSignedUrlForASubmission(school_id, assignment_id, student_id)
    }

    @Get(':assignment_id/:student_id/submission/download')
    @UseGuards(AST_AssignmentGuard()) 
    async downloadSubmissions(@Req() req: Request & {user: any}, @Param('assignment_id') assignment_id: string, @Param('student_id') student_id: string) {
        const school_id = req.user.app_metadata.school_id
        const user_id = await this.swap.swapUUID(school_id, student_id)
        return await this.assignments.downloadSubmission(school_id, assignment_id, user_id)
    }


}
