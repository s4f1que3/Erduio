import { supabaseService } from "./supabase.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [supabaseService],
    exports: [supabaseService]
})

export class SupabaseModule {}