import { Module } from "@nestjs/common";
import { teacherController } from "./teacher.controller";
import { LoggingModule } from "../logging services/logging.module";
import { teacherService } from "./teacher.service";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { GeneralAnnouncementsModule } from "../Announcements/General/announcements_general.module";
import { GroupAnnouncementsModule } from "../Announcements/Group/announcements_group.module";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { AuthModule } from "../auth/auth.module";
import { SwapModule } from "../pipes/transform.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { EmailModule } from "../emailing/email.module";

@Module({
    controllers: [teacherController],
    imports: [LoggingModule, 
        GeneralAnnouncementsModule, 
        SupabaseModule,
        SupabaseAdminModule,
        GroupAnnouncementsModule,
        AuthModule,
        SwapModule,
        LogGetterModule,
        TermsModule,
        PersonalAnnouncementsModule,
        EmailModule
    ],
    providers: [teacherService],
    exports: [teacherService]
})

export class TeacherModule {}