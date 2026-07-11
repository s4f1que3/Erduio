import { Module } from "@nestjs/common";
import { emailingService } from "./emailing.service";
import { emailController } from "./email.controller";
import { Email } from "./email.class";
import { LogGetterModule } from "../../logGetters/logGetter.module";
import { LoggingModule } from "../../logging services/logging.module";
import { SwapModule } from "../../pipes/transform.module";
import { TermsModule } from "../../terms/terms.module";
import { SupabaseAdminModule } from "../../supabaseAdminService/supabase_admin.module";
import { SupabaseModule } from "../../supabase_service/supabase.module";
import { BrevoModule } from "emailing/brevo/brevo.module";

@Module({
    controllers: [emailController],
    providers: [emailingService, Email],
    imports: [SupabaseAdminModule, LogGetterModule, LoggingModule, SwapModule, TermsModule, SupabaseModule, BrevoModule],
    exports: [emailingService]
})

export class EmailModule {}