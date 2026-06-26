import { supabaseService } from "supabase_service/supabase.service";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class termsService {
    constructor (private readonly supabase: supabaseService){}

    async setTerm(school_id: string, term_number: number, start_date: string, end_date: string) {
        const {data, error} = await this.supabase.db
        .from('Terms')
        .insert({
            school_id: school_id,
            start_date: start_date,
            end_date: end_date,
            number: term_number,
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async deleteTerm (school_id: string, term_id: string) {
        const {error} = await this.supabase.db
        .from('Terms')
        .delete()
        .eq('school_id', school_id)
        .eq('id', term_id)

        if(error) throw new InternalServerErrorException(error.message)

    }

    async updateTermDates (school_id: string, term_id: string, new_start?: string, new_end?: string) {
        const updates: Record <string, any> = {}
        if(new_start) updates.new_start = new_start
        if(new_end) updates.new_end = new_end

        const {data, error} = await this.supabase.db
        .from('Terms')
        .update(updates as any)
        .eq('school_id', school_id)
        .eq('id', term_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getCurrentTerm (school_id: string) {
        const date = new Date().toISOString()

        const {data, error} = await this.supabase.db
        .from('Terms')
        .select('id')
        .eq('school_id', school_id)
        .lte('start_date', date)
        .gte('end_date', date)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        return data.id
    }

    async getAllTerms (school_id) {
        const {data, error} = await this.supabase.db
        .from('Terms')
        .select('*')
        .eq('school_id', school_id)
        if(error) throw new InternalServerErrorException(error.message)
        return data
    }
}