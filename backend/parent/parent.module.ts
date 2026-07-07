import { Module } from "@nestjs/common";
import { parentService } from "./parent.service";
import { LoggingModule } from "../logging services/logging.module";
import { ParentController } from "./parent.controller";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { GeneralAnnouncementsModule } from "../Announcements/General/announcements_general.module";
import { GroupAnnouncementsModule } from "../Announcements/Group/announcements_group.module";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { AuthModule } from "../auth/auth.module";
import { SwapModule } from "../pipes/transform.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";
import { PersonalAnnouncementsModule } from "../Announcements/Personal/announcements_personal.module";
import { EmailModule } from "emailing/email.module";

@Module({
    controllers: [ParentController],
    imports: [LoggingModule, 
        GeneralAnnouncementsModule, 
        GroupAnnouncementsModule,
        SupabaseModule,
        SupabaseAdminModule,
        AuthModule,
        SwapModule,
        LogGetterModule,
        TermsModule,
        PersonalAnnouncementsModule,
        EmailModule
    ],
    providers: [parentService],
    exports: [parentService]
})

export class ParentModule {}