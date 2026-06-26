import { Injectable } from "@nestjs/common";
import { IpRateLimitGuard } from "./ip-rate-limit.guard";

@Injectable()
export class AuthLimiter extends IpRateLimitGuard {
    constructor() {
        super("auth", 1, 3);
    }
}
