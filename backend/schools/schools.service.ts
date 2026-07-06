import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { supabaseService } from "../supabase_service/supabase.service";

@Injectable()
export class schoolsService {

    //// for schools to edit their own info

    constructor(private readonly supabase: supabaseService){}

    async editInfo (id: string, address?: string, phone?: string, name?: string, email?: string) {
        const updates: Record <any, string> = {}

        if(address) updates.address = address
        if(phone) updates.phone_number = phone
        if(name) updates.name = name
        if(email) updates.email = email

        const{data, error} = await this.supabase.db
        .from('Schools')
        .update(updates as any)
        .eq('id', id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getSchoolInfo (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Schools')
        .select('*')
        .eq('id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async uploadLogo (school_id: string, logo: Express.Multer.File) {
        const path = `${school_id}/logo/${crypto.randomUUID()}`
        const {data: fdata, error: ferror} = await this.supabase.db.storage
        .from('logos')
        .upload(path, logo.buffer, {contentType: logo.mimetype})

        if(ferror) throw new InternalServerErrorException(ferror.message)
        const {data, error} = await this.supabase.db
        .from('Schools')
        .update({
            logo_path: path
        })
        .eq('id', school_id)
        if(error) throw new InternalServerErrorException(error.message)
        return data && fdata
    }

    async getFilePath (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Schools')
        .select('logo_path')
        .eq('id', school_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.logo_path) throw new NotFoundException('No logo for school')
        return data?.logo_path
    }

    async deleteLogo(school_id: string) {
        const path = await this.getFilePath(school_id)

        const {error: ferror} = await this.supabase.db.storage
        .from('logos')
        .remove(path as any)
        if(ferror) throw new InternalServerErrorException(ferror.message)
        
        const {error: serror} = await this.supabase.db
        .from('Schools')
        .update({
            logo_path: null
        })
        .eq('id', school_id)
        if(serror) throw new InternalServerErrorException(serror.message)
    }

    async getSignedUrl (school_id: string) {
        const path = await this.getFilePath(school_id)
        const {data, error} = await this.supabase.db.storage
        .from('logos')
        .createSignedUrl(path as any, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        return data.signedUrl
    }
}
