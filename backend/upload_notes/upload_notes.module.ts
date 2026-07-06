import { uploadedNotesController } from "./upload_notes.controller";
import { uploadNotesService } from "./upload_notes.service";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SubjectAnnouncementsModule } from "../Announcements/subject/announcement_subject.module";
import { LoggingModule } from "../logging services/logging.module";
import { TermsModule } from "../terms/terms.module";
import { Module } from "@nestjs/common";
import { SwapModule } from "../pipes/transform.module";

@Module({
    controllers: [uploadedNotesController],
    providers: [uploadNotesService],
    imports: [LoggingModule, TermsModule, SubjectAnnouncementsModule, SupabaseModule, SwapModule],
    exports: [uploadNotesService]
})

export class UploadNotesModule {}