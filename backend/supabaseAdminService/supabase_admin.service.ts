import { Inject, Injectable, Scope } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { REQUEST } from "@nestjs/core";
import { Database } from "database.types";
import type { Request } from "express";

@Injectable()
export class supabaseAdminService {
    private client: SupabaseClient;

    constructor() {
        this.client = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SERVICE_ROLE_KEY!,
        )
    }

    get db(): SupabaseClient<Database> {
        return this.client;
    }

}