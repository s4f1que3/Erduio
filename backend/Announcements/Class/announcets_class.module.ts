import { TermsModule } from "../../terms/terms.module";
import { announcementsClassService } from "./announcement_class.service";
import { classAnnouncementsController } from "./announcements_class.controller";
import { Lock, Module } from "@nestjs/common";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { LoggingModule } from "../../logging services/logging.module";
import { LogGetterModule } from "../../logGetters/logGetter.module";
import { SwapModule } from "../../pipes/transform.module";

@Module({
    controllers: [classAnnouncementsController],
    imports: [
        SupabaseModule, 
        TermsModule, 
        LoggingModule, 
        LogGetterModule, 
        SwapModule, 
        ClassAnnouncementsModule],
    providers: [announcementsClassService],
    exports: [announcementsClassService]
})

export class ClassAnnouncementsModule {}