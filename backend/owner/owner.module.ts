import { Module } from "@nestjs/common";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { LoggingModule } from "../logging services/logging.module";
import { SchoolsModule } from "../schools/schools.module";
import { ownerController } from "./owner.controller";
import { ownerService } from "./owner.service";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { SwapModule } from "../pipes/transform.module";
import { TermsModule } from "../terms/terms.module";
import { SuperAdminModule } from "../super_admin/super_admin.module";

@Module({
    controllers: [ownerController],
    providers: [ownerService],
    imports: [
        SupabaseAdminModule,
        SupabaseModule,
        LoggingModule,
        SchoolsModule,
        LogGetterModule,
        SwapModule,
        TermsModule,
        SuperAdminModule,
    ],
    exports: [ownerService]
})

export class OwnerModule {}