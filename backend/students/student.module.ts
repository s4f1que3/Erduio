import { Module } from "@nestjs/common";
import { studentService } from "./students.service";
import { LoggingModule } from "../logging services/logging.module";
import { StudentController } from "./students.controller";
import { ClassAnnouncementsModule } from "../Announcements/Class/announcets_class.module";
import { GeneralAnnouncementsModule } from "../Announcements/General/announcements_general.module";
import { GroupAnnouncementsModule } from "../Announcements/Group/announcements_group.module";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { AuthModule } from "../auth/auth.module";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { SwapModule } from "../pipes/transform.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";
import { EmailModule } from "../emailing/emailing/email.module";


@Module({
    controllers: [StudentController],
    imports: [
        LoggingModule,  
        ClassAnnouncementsModule, 
        GeneralAnnouncementsModule, 
        PersonalAnnouncementsModule,
        SupabaseModule,
        SupabaseAdminModule,
        GroupAnnouncementsModule,
        AuthModule,
        SwapModule,
        LogGetterModule,
        TermsModule,
        EmailModule
    ],
    providers: [studentService],
    exports: [studentService]
})

export class StudentModule {}