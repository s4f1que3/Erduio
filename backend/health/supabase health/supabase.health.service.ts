import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { supabaseService } from "../../supabase_service/supabase.service";

@Injectable()
export class supabaseHealthService {

    constructor(private readonly supabase: supabaseService){}

    async getHealth () {
        const results: Record <any, boolean> = {}
        try{
            // health 1 - database connection
            const {error} = await this.supabase.db
            .from('Schools')
            .select('id')
            .limit(1)

            results.database = !error
            if(error) throw new InternalServerErrorException(error.message)
        } catch {
            results.database = false
        }

        // health 2 - check auth
        try {
            const {error} = await this.supabase.db.auth.getSession()
            results.auth = !error
        } catch {
            results.auth = false
        }

        // health 3 - storage
        try {
            const {error} = await this.supabase.db.storage.listBuckets()
            results.storage = !error
        } catch {
            results.storage = false
        }

        return {
            status: Object.values(results).every(Boolean) ? 'Running' : 'Down',
            checks: results,
            timestamp: `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}`
        }
    }
}