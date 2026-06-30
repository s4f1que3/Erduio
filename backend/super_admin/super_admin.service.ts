import { Injectable, NotFoundException } from "@nestjs/common";
import { authService } from "auth/auth.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { supabaseAdminService } from "supabaseAdminService/supabase_admin.service";
import { supabaseService} from "supabase_service/supabase.service";
import { InternalServerErrorException } from "@nestjs/common";

@Injectable() 
export class superAdminService {
    
    constructor(
        private readonly supabase: supabaseService,
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly auth: authService,
        private readonly swap: uuidSwapService
    ){}

    async createSuperAdmin (name: string, email: string, password: string, phone: string, school_id: string) {
        const {data: fdata, error: ferror} = await this.supabaseAdmin.db.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true
        })
        if(ferror) throw new InternalServerErrorException(ferror.message)
        const {data, error} = await this.supabase.db
        .from('Super_Admins')
        .insert({
            email: email,
            name: name,
            phone_number: phone,
            user_id: fdata.user.id,
            school_id: school_id,
            status: 'active'
        })
        if(error) throw new InternalServerErrorException(error.message)
        return data && fdata
        
    }

    async deleteSuperAdmin (school_id: string, id: string) {
        const auth = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth, {
            ban_duration: '9000h'
        })
        if(error) throw new InternalServerErrorException(error.message)
        const {error: nerror} = await this.supabase.db
        .from('Super_Admins')
        .update({
            status: 'inactive'
        })
        .eq('school_id', school_id)
        .eq('id', id)
        if(nerror) throw new InternalServerErrorException(nerror.message)
    }

    async restoreSuperAdmin (school_id: string, id: string) {
        const auth = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth, {
            ban_duration: 'none'
        })
        if(error) throw new InternalServerErrorException(error.message)
        const {error: nerror} = await this.supabase.db
        .from('Super_Admins')
        .update({
            status: 'active'
        })
        .eq('school_id', school_id)
        .eq('id', id)
        if(nerror) throw new InternalServerErrorException(nerror.message)
    }







    ///// SUPER ADMIN PERSONAL
    async changeSuperAdminInfo(school_id: string, id: string, phone?: string, name?: string) {
        const updates: Record <string, any> = {}
        if(name !== undefined) updates.name = name
        if(phone !== undefined) updates.email = phone
    
        const {data, error} = await this.supabase.db.from('Super_Admins')
        .update(updates as any)
        .eq('id', id)
        .eq('school_id', school_id)
    
        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }
    
    async changeSuperAdminEmail(school_id: string, id: string, current_email: string, new_email: string, token: string) {
        const verifiedOTP = await this.auth.verifyOTP(current_email, token)
        if(!verifiedOTP) throw new InternalServerErrorException  ('Invalid OTP')

        const user_id = await this.swap.swapUUID(school_id, id)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            email: new_email
        })

        const {data: RegularData, error: RegularError} = await this.supabase.db.from('Super_Admins')
        .update({email: new_email})
        .eq('id', user_id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        if(RegularError) throw new InternalServerErrorException  (RegularError.message)
        return data && RegularData
    }

    async changeSuperAdminPassword(id: string, email: string, current_password: string, new_password: string) {
        const verifiedPassword = await this.auth.verifyPassword(email, current_password)
        if(!verifiedPassword) throw new InternalServerErrorException  ("Invalid Password")

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            password: new_password
        })

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async getSuperAdminProfile (school_id: string, id: string) {
        const {data, error} = await this.supabase.db.from('Super_Admins')
        .select('*')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async addProfilePicture (school_id: string, id: string, pic: Express.Multer.File) {
        const path = `${school_id}/${id}/pfp/${crypto.randomUUID()}`
        const {error: perror, data: pdata} = await this.supabase.db
        .storage
        .from('profile')
        .upload(path, pic.buffer, {contentType: pic.mimetype})

        if(perror) {
            throw new InternalServerErrorException  (perror.message)
        } else {
            const {error, data} = await this.supabase.db
            .from('Super_Admins')
            .update({
                pfp_path: path
            })
            .eq('id', id)
            .eq('school_id', school_id)
            
            if(error) throw new InternalServerErrorException  (error.message)
            return data && pdata
        }
    }

    async showProfilePicture (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Super_Admins')
        .select('pfp_path')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.pfp_path) throw new NotFoundException('No profile pic for user')
        
        const{data: sdata, error: serror} = await this.supabase.db.storage
        .from('profile')
        .createSignedUrl(data?.pfp_path, 3600)
        if(serror) throw new InternalServerErrorException(serror.message)
        return sdata?.signedUrl
    }

    async deleteProfilePicture (school_id: string, id: string) {
        const {data: pdata, error: perror} = await this.supabase.db
        .from('Super_Admins')
        .select('pfp_path')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(perror) throw new InternalServerErrorException(perror.message)
        if(!pdata?.pfp_path) throw new NotFoundException('No profile pic for user')


        const {data: odata, error: oerror} = await this.supabase.db.storage
        .from('profile')
        .remove(pdata?.pfp_path as any)

        if(oerror) {
            throw new InternalServerErrorException  (oerror.message)
        } else {
            const {data, error} = await this.supabase.db
            .from('Super_Admins')
            .update({
                pfp_path: null
            })
            .eq('id', id)
            .eq('school_id', school_id)

            if(error) throw new InternalServerErrorException  (error.message)
            return data && odata
        }
    }


    /// 
    async getActiveAdmins (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Super_Admins')
        .select('*')
        .eq('status', 'active')
        .eq('school_id', school_id)
        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async getInactiveAdmins (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Super_Admins')
        .select('*')
        .eq('status', 'inactive')
        .eq('school_id', school_id)
        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }


}