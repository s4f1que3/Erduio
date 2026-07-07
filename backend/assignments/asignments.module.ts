import { LoggingModule } from "../logging services/logging.module";
import { assignmentService } from "./assignment.service";
import { assignmentsController } from "./assignments.controller";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SwapModule } from "../pipes/transform.module";
import { TermsModule } from "../terms/terms.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { SubjectAnnouncementsModule } from "../Announcements/subject/announcement_subject.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { EmailModule } from "emailing/email.module";

@Module({
    controllers: [assignmentsController],
    providers: [assignmentService],
    imports: [
        LoggingModule, 
        SupabaseModule, 
        SwapModule,
        TermsModule,
        LogGetterModule,
        SubjectAnnouncementsModule,
        PersonalAnnouncementsModule,
        EmailModule
    ],
    exports: [assignmentService]
})

export class AssignmentsModule {}