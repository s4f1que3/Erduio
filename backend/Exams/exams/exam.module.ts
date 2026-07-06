import { Module } from "@nestjs/common";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { examService } from "./exam.service";
import { examsController } from "./exam.controller";
import { SwapModule } from "../../pipes/transform.module";
import { LoggingModule } from "../../logging services/logging.module";
import { PersonalAnnouncementsModule } from "../../Announcements/Personal/announcements_personal.module";
import { SubjectAnnouncementsModule } from "../../Announcements/subject/announcement_subject.module";

@Module ({
    controllers: [examsController],
    providers: [examService],
    imports: [
        SupabaseModule,
        SwapModule,
        LoggingModule,
        PersonalAnnouncementsModule,
        SubjectAnnouncementsModule
    ],
    exports: [examService]
})

export class ExamsModule {}