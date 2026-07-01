import { Injectable } from "@nestjs/common";
import { NestjsHealthService } from "./nestjs health/nestjs.health.service";
import { supabaseHealthService } from "./supabase health/supabase.health.service";
import { vercelHealthService } from "./vercel health/vercel.health.service";

@Injectable()
export class healthService {
    constructor(
        private readonly s: supabaseHealthService,
        private readonly v: vercelHealthService,
        private readonly n: NestjsHealthService
    ){}

    async getHealth () {
        return await Promise.all([
            this.s.getHealth(),
            this.n.getHealth(),
            this.v.getHealth()
        ])
    }
}