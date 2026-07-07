import { supabaseService } from "../supabase_service/supabase.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class uuidSwapService {

    constructor(private readonly supabase: supabaseService){}

    async swapUUID (school_id: string, id: string | null) {
        if(!id) throw new InternalServerErrorException  ('id is required')
        const roleTables = ['Super_Admins', 'Admins', 'Teachers', 'Parents', 'Students'] as const

        const results = await Promise.all(
            roleTables.map((roleTable) =>
                this.supabase.db
                    .from(roleTable)
                    .select('id')
                    .eq('school_id', school_id)
                    .eq('user_id', id)
                    .maybeSingle()
            )
        )

        for (const { data, error } of results) {
            if (error) throw new InternalServerErrorException (error.message)
            if (data?.id) return data.id
        }

        throw new InternalServerErrorException ('user not found in any role table - uuid swap')
    }

    async swapUUIDFromIdToAuth (school_id: string, id: string | null) {
        if(!id) throw new InternalServerErrorException  ('id is required')
        const roleTables = ['Super_Admins', 'Admins', 'Teachers', 'Parents', 'Students'] as const

        const results = await Promise.all(
            roleTables.map((roleTable) =>
                this.supabase.db
                    .from(roleTable)
                    .select('user_id')
                    .eq('school_id', school_id)
                    .eq('id', id)
                    .maybeSingle()
            )
        )

        for (const { data, error } of results) {
            if (error) throw new InternalServerErrorException (error.message)
            if (data?.user_id) return data.user_id
        }

        throw new NotFoundException('No auth id found for user - swap service')
    }

    async getUserDataByEmail (email: string) {
        if(!email) throw new InternalServerErrorException ('email is required')
        const roleTables = ['Super_Admins', 'Admins', 'Teachers', 'Parents', 'Students'] as const

        const results = await Promise.all(
            roleTables.map((roleTable) =>
                this.supabase.db
                    .from(roleTable)
                    .select('user_id')
                    .eq('email', email)
                    .maybeSingle()
            )
        )

        for (const { data, error } of results) {
            if (error) throw new InternalServerErrorException (error.message)
            if (data?.user_id) return data.user_id
        }

        throw new InternalServerErrorException ('email not found')
    }
}