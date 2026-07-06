import { announcementsGeneralService } from "./announcements_general.service";
import { announcementsGeneralController } from "./announcements_general.controller";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { TermsModule } from "../../terms/terms.module";
import { LoggingModule } from "../../logging services/logging.module";
import { LogGetterModule } from "../../logGetters/logGetter.module";
import { SwapModule } from "../../pipes/transform.module";

@Module ({
    controllers: [announcementsGeneralController],
    providers: [announcementsGeneralService],
    imports: [SupabaseModule, TermsModule, LoggingModule, LogGetterModule, SwapModule],
    exports: [announcementsGeneralService]
})

export class GeneralAnnouncementsModule {}