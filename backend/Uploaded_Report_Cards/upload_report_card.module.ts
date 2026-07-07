import { uploadReportCardService } from "./upload_report_card.service";
import { uploadedReportCardsController } from "./upload_report_card.controller";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { TermsModule } from "../terms/terms.module";
import { SwapModule } from "../pipes/transform.module";
import { LoggingModule } from "../logging services/logging.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { EmailModule } from "../emailing/email.module";

@Module({
    controllers: [uploadedReportCardsController],
    providers: [uploadReportCardService],
    imports: [SupabaseModule, TermsModule, SwapModule, LoggingModule, LogGetterModule, PersonalAnnouncementsModule, EmailModule],
    exports: [uploadReportCardService]
})

export class UploadReportCardModule {}