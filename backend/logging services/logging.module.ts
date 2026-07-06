import { SupabaseModule } from "../supabase_service/supabase.module";
import { LoggingService } from "./logging.service";
import { Module, forwardRef } from "@nestjs/common";
import { TermsModule } from "../terms/terms.module";

@Module({
    providers: [LoggingService],
    imports: [SupabaseModule, forwardRef(() => TermsModule)],
    exports: [LoggingService]
})

export class LoggingModule {}