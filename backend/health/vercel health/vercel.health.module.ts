import { Module } from "@nestjs/common";
import { vercelHealthService } from "./vercel.health.service";

@Module({
    providers: [vercelHealthService],
    exports: [vercelHealthService]
})

export class VercelHealthModule {}