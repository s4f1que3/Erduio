import { Injectable } from "@nestjs/common";
import { IpRateLimitGuard } from "./ip-rate-limit.guard";

@Injectable()
export class UploadsLimiter extends IpRateLimitGuard {
    constructor() {
        super("uploads", 1, 3);
    }
}
