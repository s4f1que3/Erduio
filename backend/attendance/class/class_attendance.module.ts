import { classAttendanceController } from "./class_attendance.controller";
import { classAttendanceService } from "./class_attendance.service";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { TermsModule } from "../../terms/terms.module";
import { LoggingModule } from "../../logging services/logging.module";
import { Module } from "@nestjs/common";
import { SwapModule } from "../../pipes/transform.module";
import { ClassAnnouncementsModule } from "../../Announcements/Class/announcets_class.module";
import { EmailModule } from "emailing/email.module";

@Module({
    controllers: [classAttendanceController],
    providers: [classAttendanceService],
    imports: [TermsModule, SupabaseModule, LoggingModule, SwapModule, ClassAnnouncementsModule, EmailModule],
    exports: [classAttendanceService]
})

export class ClassAttendanceModule {}
