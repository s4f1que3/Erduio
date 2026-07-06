import { Module } from "@nestjs/common";
import { authController } from "./auth.controller";
import { authService } from "./auth.service";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { SwapModule } from "../pipes/transform.module";
import { SenModule } from "../sentry/sentry.module";

@Module({
    controllers: [authController],
    providers: [authService],
    imports: [SupabaseModule, SupabaseAdminModule, SwapModule, SenModule],
    exports: [authService]
})

export class AuthModule{}