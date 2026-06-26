import { Injectable } from "@nestjs/common";
import { IpRateLimitGuard } from "./ip-rate-limit.guard";

@Injectable()
export class ReportCardGenerationLimiter extends IpRateLimitGuard {
    constructor() {
        super("report-card-generation", 1, 5);
    }
}
