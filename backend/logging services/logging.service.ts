import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"

@Injectable()
export class LoggingService{
    constructor(
        private readonly supabase: supabaseService,
    ){}

    //// log insertion
    async insertAdminLog (school_id: string, actor: string, message: string) {
        const new_message = `${actor} ${message} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}`
        const {data, error} = await this.supabase.db
        .from('Admin_Logs')
        .insert({
            message: new_message,
            school_id: school_id,
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async insertSimpleAdminLog (school_id: string, message: string) {
        const new_message = `${message} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}`
        const { data, error} = await this.supabase.db
        .from('Admin_Logs')
        .insert({
            school_id: school_id,
            message: new_message
        })
        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async insertPersonalLog (school_id: string, belongs_id: string, message: string) {
        const new_message = `${message} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}`
        const {data, error} = await this.supabase.db.from('Personal_Logs')
        .insert({
            message: new_message,
            belongs_to_id: belongs_id,
            school_id: school_id
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async insertOwnerLog (message: string) {
        const {error} = await this.supabase.db
        .from('Onwer_Logs')
        .insert({
            message: message
        })

        if(error) throw new InternalServerErrorException(error.message)
    }







    //// log fetching
    async getPersonalLogs (school_id: string, user_id: string) {
        const {data, error} = await this.supabase.db
        .from('Personal_Logs')
        .select('*')
        .eq('school_id', school_id)
        .eq('belongs_to_id', user_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAminLogs(school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Admin_Logs')
        .select('*')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getOwnerLogs () {
        const { data, error} = await this.supabase.db
        .from('Onwer_Logs')
        .select('*')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

}
