import { Module } from "@nestjs/common";
import { authController } from "./auth.controller";
import { authService } from "./auth.service";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SupabaseAdminModule } from "../supabaseAdminService/supabase_admin.module";
import { SwapModule } from "../pipes/transform.module";

@Module({
    controllers: [authController],
    providers: [authService],
    imports: [SupabaseModule, SupabaseAdminModule, SwapModule],
    exports: [authService]
})

export class AuthModule{}