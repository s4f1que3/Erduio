import { supabaseAdminService } from "./supabase_admin.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [supabaseAdminService],
    exports: [supabaseAdminService]
})

export class SupabaseAdminModule {}