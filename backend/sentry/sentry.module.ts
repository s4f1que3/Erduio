import { Module } from "@nestjs/common";
import { sentryService } from "./sentry.service";

@Module({
    providers: [sentryService],
    exports: [sentryService]
})

export class SenModule {}