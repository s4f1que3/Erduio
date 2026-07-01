import { TerminusModule } from "@nestjs/terminus";
import { NestjsHealthService } from "./nestjs.health.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [NestjsHealthService],
    imports: [TerminusModule],
    exports: [NestjsHealthService]
})

export class NestjsHealthModule {}