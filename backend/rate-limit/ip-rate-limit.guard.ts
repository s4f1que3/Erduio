import { CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis.client";

export abstract class IpRateLimitGuard implements CanActivate {
    private readonly ratelimit: Ratelimit;

    constructor(prefix: string, limit: number, windowSeconds: number) {
        this.ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.fixedWindow(limit, `${windowSeconds} s`),
            prefix: `ratelimit:${prefix}`,
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const ip = req.ips?.length ? req.ips[0] : req.ip;
        const { success } = await this.ratelimit.limit(ip ?? "unknown");

        if (!success) {
            throw new HttpException("Too many requests, please slow down.", HttpStatus.TOO_MANY_REQUESTS);
        }

        return true;
    }
}
