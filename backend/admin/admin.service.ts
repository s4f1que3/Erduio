import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { supabaseService } from "supabase_service/supabase.service";
import { supabaseAdminService } from "../supabaseAdminService/supabase_admin.service";
import { authService } from "auth/auth.service";
import { announcementsGeneralService } from "Announcements/General/announcements_general.service";
import { announcementsGroupService } from "Announcements/Group/announcements_group.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";

@Injectable()
export class adminService{
    constructor(
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly supabase: supabaseService,
        private readonly auth: authService,
        private readonly generalAnnoun: announcementsGeneralService,
        private readonly groupAnnoun: announcementsGroupService,
        private readonly swap: uuidSwapService
    ){}

    ///// ADMIN CRUD - DONE BY SUPER ADMINS
    async createAdmin(school_id: string, email: string, password: string, name: string, phone: string) {
        const {data, error} = await this.supabaseAdmin.db.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            app_metadata: {role: 'admin', status: 'active', school_id: school_id}

        })

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
            await this.supabase.db.from('Admins').insert({
                user_id: data.user.id,
                email: email,
                name: name,
                phone_number: phone,
                status: 'active',
                school_id: school_id
            })
        }

        return data

    }

    async getAdmins(school_id: string) {
        const {data, error} = await this.supabase.db.from('Admins')
        .select('*')
        .eq('status', 'active')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async changeAdminInfo(school_id: string, id: string, name?: string, phone?: string) {
        const updates: Record <string, any> = {}
        if(name !== undefined) updates.name = name
        if(phone !== undefined) updates.phone_number = phone

        const {data, error} = await this.supabase.db.from('Admins')
        .update(updates as any)
        .eq('id', id)
        .eq('school_id', school_id)


        if(error) throw new InternalServerErrorException(error.message)
        return data

    }

    async changeAdminEmail(school_id: string, id: string, email: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)

        const {error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            email: email
        })

        const {data: RegularData, error: RegularError} = await this.supabase.db.from('Admins')
        .update({email: email})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        if(RegularError) throw new InternalServerErrorException(RegularError.message)
        return RegularData
    }

    async changeAdminPassword(school_id: string, id: string, password: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            password: password
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async deleteAdmin (school_id: string, id: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {data, error} = await this.supabase.db.from('Admins')
        .update({status: 'inactive'})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
                const{error: nerror, data: ndata} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
                app_metadata: {status: 'inactive'},
                ban_duration: '90000h'

            })

            await this.supabaseAdmin.db.rpc('delete_user_sessions', {
                target_user_id: auth_id
            })

            if(nerror) throw new InternalServerErrorException(nerror.message)
            return data && ndata
        }
    }

    async getAdminProfile (school_id: string, id: string) {
        const {data, error} = await this.supabase.db.from('Admins')
        .select('*')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getInactive (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Admins')
        .select('*')
        .eq('status', 'inactive')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async UndoDeleteAdmin (school_id: string, id: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {data, error} = await this.supabase.db.from('Admins')
        .update({status: 'active'})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
                const{error: nerror, data: ndata} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
                app_metadata: {status: 'active'},
                ban_duration: 'none'

            })

            if(nerror) throw new InternalServerErrorException(nerror.message)
            return data && ndata
        }
    }







    //// personal

    async changeAdminEmail_Personal(school_id: string, id: string, current_email: string, new_email: string, token: string) {
        const verifiedOTP = await this.auth.verifyOTP(current_email, token)
        if(!verifiedOTP) throw new UnauthorizedException('Invalid OTP')

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            email: new_email
        })

        const {data: RegularData, error: RegularError} = await this.supabase.db.from('Admins')
        .update({email: new_email})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        if(RegularError) throw new InternalServerErrorException(RegularError.message)
        return data && RegularData
    }

    async changeAdminPassword_Personal(id: string, email: string, current_password: string, new_password: string) {
        const verifiedPassword = await this.auth.verifyPassword(email, current_password)
        if(!verifiedPassword) throw new UnauthorizedException("Invalid Password")

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            password: new_password
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async changeAdminInfo_Personal(school_id: string, id: string, name?: string, phone?: string) {
        const updateData: Record <string, any> = {}
        if(name !== undefined) updateData.name = name
        if(phone !== undefined) updateData.phone_number = phone

        const {data, error} = await this.supabase.db.from('Admins')
        .update(updateData as any)
        .eq('id', id)
        .eq('school_id', school_id)

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
            throw new InternalServerErrorException(perror.message)
        } else {
            const {error, data} = await this.supabase.db
            .from('Admins')
            .update({
                pfp_path: path
            })
            .eq('id', id)
            .eq('school_id', school_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data && pdata
        }
    }

    async showProfilePicture (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Admins')
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
        .from('Admins')
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
            .from('Admins')
            .update({
                pfp_path: null
            })
            .eq('id', id)
            .eq('school_id', school_id)

            if(error) throw new InternalServerErrorException  (error.message)
            return data && odata
        }
    }

    async fetchGeneralAnnouncements (school_id: string) {
        return await this.generalAnnoun.getAll(school_id)
    }


    async fetchForAdminGroup (school_id: string) {
        return await this.groupAnnoun.getAllForGroup(school_id, 'admins')
    }
}
