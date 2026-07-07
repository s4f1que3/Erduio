import { Module } from "@nestjs/common";
import { ReportCardController } from "./report_card.controller";
import { ReportCardService } from "./report_card.service";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SwapModule } from "../pipes/transform.module";
import { LoggingModule } from "../logging services/logging.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { SubjectAttendanceModule } from "../attendance/subject/subject_attendance.module";
import { EmailModule } from "../emailing/email.module";

@Module({
    controllers: [ReportCardController],
    providers: [ReportCardService],
    imports: [SupabaseModule, SwapModule, LoggingModule, LogGetterModule, TermsModule, PersonalAnnouncementsModule, SubjectAttendanceModule, EmailModule],
    exports: [ReportCardService]
})

export class GeneratedReportCardModule {}
