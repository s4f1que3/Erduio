import { announcementsPersonalController } from "./announcements_personal.controller";
import { announcementsPersonalService } from "./announcements_personal.service";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { SwapModule } from "../../pipes/transform.module";
import { TermsModule } from "../../terms/terms.module";
import { LoggingModule } from "../../logging services/logging.module";
import { LogGetterModule } from "../../logGetters/logGetter.module";
import { EmailModule } from "../../emailing/emailing/email.module";

@Module({
    controllers: [announcementsPersonalController],
    providers: [announcementsPersonalService],
    imports: [SupabaseModule, SwapModule, TermsModule, LoggingModule, LogGetterModule, EmailModule],
    exports: [announcementsPersonalService]
})

export class PersonalAnnouncementsModule {}