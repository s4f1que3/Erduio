import { SupabaseModule } from "../supabase_service/supabase.module";
import { disciplineController } from "./discipline_student.controller";
import { disciplineService } from "./discipline_student.service";
import { Module } from "@nestjs/common";
import { SwapModule } from "../pipes/transform.module";
import { LoggingModule } from "../logging services/logging.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { EmailModule } from "../emailing/email.module";

@Module({
    controllers: [disciplineController],
    providers: [disciplineService],
    imports: [SupabaseModule, SwapModule, LoggingModule, LogGetterModule, TermsModule, PersonalAnnouncementsModule, EmailModule],
    exports: [disciplineService]
})

export class DisciplineModule {}