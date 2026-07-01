import { Module } from "@nestjs/common";
import { supabaseHealthService } from "./supabase.health.service";
import { SupabaseModule } from "supabase_service/supabase.module";

@Module({
    providers: [supabaseHealthService],
    imports: [SupabaseModule],
    exports: [supabaseHealthService]
})

export class SupabaseHealthModule {}