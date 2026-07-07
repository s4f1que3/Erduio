import { EmailModule } from "../../emailing/email.module";
import { lateController } from "./late.controller";
import { lateService } from "./late.service";
import { Module } from "@nestjs/common";
import { SupabaseAdminModule } from "../../supabaseAdminService/supabase_admin.module";

@Module({
    controllers: [lateController],
    providers: [lateService],
    imports: [EmailModule, SupabaseAdminModule],
    exports: [lateService]
})

export class LateModule {}