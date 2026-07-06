import { Module } from "@nestjs/common";
import { classesController } from "./clases.controller";
import { classesService } from "./classes.service";
import { SupabaseModule } from "../supabase_service/supabase.module";
import { SwapModule } from "../pipes/transform.module";
import { LoggingModule } from "../logging services/logging.module";
import { LogGetterModule } from "../logGetters/logGetter.module";
import { TermsModule } from "../terms/terms.module";

@Module({
    controllers: [classesController],
    imports: [SupabaseModule, SwapModule, LoggingModule, LogGetterModule, TermsModule],
    providers: [classesService],
    exports: [classesService]
})

export class ClassesModule {}