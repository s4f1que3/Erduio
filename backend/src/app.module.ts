import 'dotenv/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GeneralLimiter } from 'rate-limit/general.limiter';
import { AdminModule } from 'admin/admin.module';
import { GeneralAnnouncementsModule } from 'Announcements/General/announcements_general.module';
import { ClassAnnouncementsModule } from 'Announcements/Class/announcets_class.module';
import { GroupAnnouncementsModule } from 'Announcements/Group/announcements_group.module';
import { PersonalAnnouncementsModule} from 'Announcements/Personal/announcements_personal.module';
import { AssignmentsModule } from 'assignments/asignments.module';
import { AuthModule } from 'auth/auth.module';
import { ClassesModule } from 'classes/classes.module';
import { LoggingModule } from 'logging services/logging.module';
import { ParentModule } from 'parent/parent.module';
import { StudentModule } from 'students/student.module';
import { SupabaseModule } from 'supabase_service/supabase.module';
import { SupabaseAdminModule } from "supabaseAdminService/supabase_admin.module";
import { SuperAdminModule } from 'super_admin/super_admin.module';
import { TeacherModule } from 'teachers/teacher.module';
import { TermsModule } from 'terms/terms.module';
import { UploadReportCardModule } from 'Uploaded_Report_Cards/upload_report_card.module';
import { UploadNotesModule } from 'upload_notes/upload_notes.module';
import { SubjectAnnouncementsModule } from 'Announcements/subject/announcement_subject.module';
import { ClassAttendanceModule } from 'attendance/class/class_attendance.module';
import { SubjectAttendanceModule } from 'attendance/subject/subject_attendance.module';
import { DisciplineModule } from 'discipline_student/discipline_student.module';
import { GeneratedReportCardModule } from 'generate_report_card/report_card.module';
import { FileVaultModule } from 'file_vault/file_vault.module';
import { SchoolsModule } from 'schools/schools.module';
import { ExamsModule } from 'Exams/exams/exam.module';
import { ExamGradesModule } from 'Exams/exam grades/exam_grade.module';
import { LogGetterModule } from 'logGetters/logGetter.module';
import * as joi from 'joi'
import { OwnerModule } from 'owner/owner.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      cache: true,
      validationSchema: joi.object({
        SUPABASE_URL: joi.string().uri().required(),
        PUBLISHABLE_KEY: joi.string().required(),
        SERVICE_ROLE_KEY: joi.string().required(),
        UPSTASH_REDIS_REST_URL: joi.string().uri().required(),
        UPSTASH_REDIS_REST_TOKEN: joi.string().required(),
        
      })
    }),
    AdminModule,
    GeneralAnnouncementsModule,
    ClassAnnouncementsModule,
    GroupAnnouncementsModule,
    PersonalAnnouncementsModule,
    AssignmentsModule,
    AuthModule,
    ClassesModule,
    LoggingModule,
    ParentModule,
    StudentModule,
    SupabaseAdminModule, SupabaseModule,
    SuperAdminModule,
    TeacherModule,
    TermsModule,
    UploadReportCardModule,
    UploadNotesModule,
    SubjectAnnouncementsModule,
    ClassAttendanceModule,
    SubjectAttendanceModule,
    DisciplineModule,
    GeneratedReportCardModule,
    FileVaultModule,
    SchoolsModule,
    ExamsModule,
    ExamGradesModule,
    LogGetterModule,
    OwnerModule

  ],

  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GeneralLimiter,
    },
  ],
})
export class AppModule {}
