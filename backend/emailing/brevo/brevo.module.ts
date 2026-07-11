import { Module } from "@nestjs/common";
import { brevoClient } from "./brevo.class";

@Module({
    providers: [brevoClient],
    exports: [brevoClient]
})

export class BrevoModule {}