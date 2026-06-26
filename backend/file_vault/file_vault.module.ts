import { Module } from "@nestjs/common";
import { SupabaseModule } from "supabase_service/supabase.module";
import { vaultController } from "./file_vault.controller";
import { vaultService } from "./file_vault.service";
import { SwapModule } from "pipes/transform.module";
import { LoggingModule } from "logging services/logging.module";

@Module({
    controllers: [vaultController],
    providers: [vaultService],
    imports: [SupabaseModule, SwapModule, LoggingModule],
    exports: [vaultService]
})

export class FileVaultModule {}