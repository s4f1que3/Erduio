import { subjectAttendanceService } from "./subject_attendance.service";
import { subjectAttendanceController } from "./subject_attendance.controller";
import { LoggingModule } from "logging services/logging.module";
import { SupabaseModule } from "supabase_service/supabase.module";
import { Module } from "@nestjs/common";
import { TermsModule } from "terms/terms.module";
import { SwapModule } from "pipes/transform.module";
import { SubjectAnnouncementsModule } from "Announcements/subject/announcement_subject.module";

@Module({
    controllers: [subjectAttendanceController],
    providers: [subjectAttendanceService],
    imports: [LoggingModule, SupabaseModule, TermsModule, SwapModule, SubjectAnnouncementsModule],
    exports: [subjectAttendanceService]
})

export class SubjectAttendanceModule {}