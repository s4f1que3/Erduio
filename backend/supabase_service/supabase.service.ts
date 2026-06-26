import { Inject, Injectable, Scope } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { REQUEST } from "@nestjs/core";
import { Database } from "database.types";
import type { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class supabaseService {
    private client: SupabaseClient;

    constructor(@Inject(REQUEST) request: Request) {
        const token = request.headers.authorization?.split(' ')[1]
        this.client = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.PUBLISHABLE_KEY!,
            token ? { global: {headers: {Authorization: `Bearer ${token}`}}} : {}
        )
    }

    get db(): SupabaseClient<Database> {
        return this.client;
    }

}

