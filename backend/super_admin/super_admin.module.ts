import { superAdminService } from "./super_admin.service";
import { superAdminController } from "./super_admin.controller";
import { Module } from "@nestjs/common";
import { LoggingModule } from "../logging services/logging.module";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { AuthModule } from "../auth/auth.module";
import { SwapModule } from "../pipes/transform.module";

@Module({
    controllers: [superAdminController],
    imports: [LoggingModule, SupabaseModule, SupabaseAdminModule, AuthModule, SwapModule],
    providers: [superAdminService],
    exports: [superAdminService]
})

export class SuperAdminModule {}