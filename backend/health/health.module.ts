import { NestjsHealthModule } from "./nestjs health/nestjs.health.module";
import { Module } from "@nestjs/common";
import { SupabaseHealthModule } from "./supabase health/supabase.health.module";
import { VercelHealthModule } from "./vercel health/vercel.health.module";
import { healthService } from "./health.service";
import { healthController } from "./health.controller";

@Module({
    controllers: [healthController],
    providers: [healthService],
    imports: [SupabaseHealthModule, VercelHealthModule, NestjsHealthModule],
    exports: [healthService]
})

export class HealthModule {}