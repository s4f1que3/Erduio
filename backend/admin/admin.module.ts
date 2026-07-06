import { adminController } from "./admin.controller";
import { adminService } from "./admin.service";
import { Module } from "@nestjs/common";
import { LoggingModule } from "../logging services/logging.module";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { AuthModule } from "../auth/auth.module";
import { SwapModule } from "../pipes/transform.module";
import { GeneralAnnouncementsModule } from "../Announcements/General/announcements_general.module";
import { GroupAnnouncementsModule } from "../Announcements/Group/announcements_group.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";

@Module({
    controllers: [adminController],
    imports: [
        LoggingModule,
        SwapModule,
        SupabaseModule,
        SupabaseAdminModule,
        AuthModule,
        GeneralAnnouncementsModule,
        GroupAnnouncementsModule,
        LogGetterModule,
        TermsModule
    ],
    providers: [adminService],
    exports: [adminService]
})

export class AdminModule {}