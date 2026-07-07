import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { emailingService } from "./emailing.service";
import { emailController } from "./email.controller";
import { Email } from "./email.class";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { LoggingModule } from "../logging services/logging.module";
import { SwapModule } from "../pipes/transform.module";
import { TermsModule } from "../terms/terms.module";

@Module({
    controllers: [emailController],
    providers: [emailingService, Email],
    imports: [SupabaseModule, LogGetterModule, LoggingModule, SwapModule, TermsModule],
    exports: [emailingService]
})

export class EmailModule {}