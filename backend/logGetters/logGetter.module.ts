import { Module } from "@nestjs/common";
import { SupabaseModule } from "supabase_service/supabase.module";
import { logGetterService } from "./logGetters.service";

@Module({
    providers: [logGetterService],
    imports: [SupabaseModule],
    exports: [logGetterService]
})

export class LogGetterModule {}