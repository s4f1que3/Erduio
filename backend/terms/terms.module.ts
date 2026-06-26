import { SupabaseModule } from "supabase_service/supabase.module";
import { termsController } from "./terms.controller";
import { termsService } from "./terms.service";
import { forwardRef, Module} from "@nestjs/common";
import { LoggingModule } from "logging services/logging.module";
import { LogGetterModule } from "logGetters/logGetter.module";
import { SwapModule } from "pipes/transform.module";

@Module({
    controllers: [termsController],
    providers: [termsService],
    imports: [SupabaseModule, forwardRef(() => LoggingModule), LogGetterModule, SwapModule],
    exports: [termsService]
})

export class TermsModule {}