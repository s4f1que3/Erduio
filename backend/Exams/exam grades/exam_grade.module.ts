import { Module } from "@nestjs/common";
import { examGradesController } from "./exam_grade.controller";
import { examGradeService } from "./exam_grade.service";
import { SupabaseModule } from "supabase_service/supabase.module";
import { SwapModule } from "pipes/transform.module";
import { LoggingModule } from "logging services/logging.module";
import { PersonalAnnouncementsModule } from "Announcements/Personal/announcements_personal.module";

@Module({
    controllers: [examGradesController],
    providers: [examGradeService],
    imports: [SupabaseModule, SwapModule, LoggingModule, PersonalAnnouncementsModule],
    exports: [examGradeService]
})

export class ExamGradesModule {}