import { uuidSwapService } from "./transformuuid.pipe";
import { Module } from "@nestjs/common";
import { SupabaseModule } from "supabase_service/supabase.module";

@Module({
    providers: [uuidSwapService],
    imports: [SupabaseModule],
    exports: [uuidSwapService]
})

export class SwapModule {}