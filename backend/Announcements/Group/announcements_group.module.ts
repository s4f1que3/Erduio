import { announcementsGroupService } from "./announcements_group.service";
import { groupAnnouncementsController } from "./announcements_group.controller";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { TermsModule } from "../../terms/terms.module";
import { LoggingModule } from "../../logging services/logging.module";
import { LogGetterModule } from "../../logGetters/logGetter.module";
import { SwapModule } from "../../pipes/transform.module";
import { EmailModule } from "../../emailing/emailing/email.module";

@Module({
    controllers: [groupAnnouncementsController],
    providers: [announcementsGroupService],
    imports: [SupabaseModule, TermsModule, LoggingModule, LogGetterModule, SwapModule, EmailModule],
    exports: [announcementsGroupService]
})

export class GroupAnnouncementsModule {}