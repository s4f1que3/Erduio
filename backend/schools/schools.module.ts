import { Module } from "@nestjs/common";
import { schoolsController } from "./schools.controller";
import { schoolsService } from "./schools.service";
import { SupabaseModule } from "supabase_service/supabase.module";
import { LogGetterModule } from "logGetters/logGetter.module";
import { LoggingModule } from "logging services/logging.module";
import { SwapModule } from "pipes/transform.module";
import { TermsModule } from "terms/terms.module";

@Module({
    controllers: [schoolsController],
    providers: [schoolsService],
    imports: [SupabaseModule, LogGetterModule, LoggingModule, SwapModule, TermsModule],
    exports: [schoolsService]
})

export class SchoolsModule {}
