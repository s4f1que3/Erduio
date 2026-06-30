import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggingService } from "logging services/logging.service";
import { schoolsService } from "schools/schools.service";
import { supabaseService } from "supabase_service/supabase.service";
import { supabaseAdminService } from "supabaseAdminService/supabase_admin.service";
import { superAdminService } from "super_admin/super_admin.service";

@Injectable()
export class ownerService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly school: schoolsService,
        private readonly personal: LoggingService,
        private readonly sas: superAdminService,
    ){}

    async createSchool (name: string, phone: string, address: string, email: string, logo?: Express.Multer.File) {
        if(logo) {
            const path = `${name}/logo/${crypto.randomUUID()}`
            const {data: fdata, error: ferror} = await this.supabase.db.storage
            .from('logos')
            .upload(path, logo.buffer, {contentType: logo.mimetype})
            if(ferror) throw new InternalServerErrorException(ferror.message)
            
            const {data, error} = await this.supabase.db
            .from('Schools')
            .insert({
                name: name,
                phone_number: phone,
                address: address,
                email: email,
                logo_path: path

            })

            if(error) throw new InternalServerErrorException(error.message)
            return data && fdata
        } else {
            const {data, error} = await this.supabase.db
            .from('Schools')
            .insert({
                name: name,
                phone_number: phone,
                address: address,
                email: email,

            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getSchools () {
        const {data, error} = await this.supabase.db
        .from('Schools')
        .select('*')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async editSchool (id: string, address?: string, phone?: string, name?: string, email?: string) {
        return await this.school.editInfo(id, address, phone, name, email)
    }

    async getSignedUrl (id: string) {
        return await this.school.getSignedUrl(id)
    }

    async disableSchool (id: string) {
        const {error} = await this.supabaseAdmin.db.rpc('disable_school', {
            school_id: id
        })
        if(error) throw new InternalServerErrorException(error.message)
    }

    async enableSchool (id: string) {
        const {error} = await this.supabaseAdmin.db.rpc('enable_school', {
            school_id: id
        })
        if(error) throw new InternalServerErrorException(error.message)
    }



    /// super admins - these dont have edit infos for me because supers can edit themselves
    async createSuperAdmin (name: string, email: string, password: string, phone: string, school_id: string) {
        return await this.sas.createSuperAdmin(name, email, password, phone, school_id)
    }

    async deleteSuperAdmin (school_id: string, id: string) {
        return await this.sas.deleteSuperAdmin(school_id, id)
    }

    async restoreSuperAdmin (school_id: string, id: string) {
        return await this.sas.restoreSuperAdmin(school_id, id)
    }

    async getActiveSuperAdmins (school_id: string) {
        return await this.sas.getActiveAdmins(school_id)
    }

    async getInactiveSuperAdmins (school_id: string) {
        return await this.sas.getInactiveAdmins(school_id)
    }



    async fetchLogs () {
        return await this.personal.getOwnerLogs()
    }

}