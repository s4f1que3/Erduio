import { SupabaseModule } from "../../supabase_service/supabase.module";
import { EmailModule } from "../../emailing/email.module";
import { lateController } from "./late.controller";
import { lateService } from "./late.service";
import { Module } from "../../node_modules/@nestjs/common";

@Module({
    controllers: [lateController],
    providers: [lateService],
    imports: [EmailModule, SupabaseModule],
    exports: [lateService]
})

export class LateModule {}