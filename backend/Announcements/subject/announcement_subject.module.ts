import { SubjectAnnouncementsController } from "./announement_subject.controller";
import { announcementsSubjectService } from "./announcement_subject.service";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "supabase_service/supabase.module";
import { TermsModule } from "terms/terms.module";
import { SwapModule } from "pipes/transform.module";
import { LoggingModule } from "logging services/logging.module";
import { LogGetterModule } from "logGetters/logGetter.module";

@Module({
    controllers: [SubjectAnnouncementsController],
    imports: [SupabaseModule, TermsModule, SwapModule, LoggingModule, LogGetterModule],
    providers: [announcementsSubjectService],
    exports: [announcementsSubjectService]
})

export class SubjectAnnouncementsModule {}