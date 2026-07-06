import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { supabaseService} from "../supabase_service/supabase.service";
import { supabaseAdminService } from "../supabaseAdminService/supabase_admin.service";
import { authService } from "../auth/auth.service";
import { announcementsGeneralService } from "../Announcements/General/announcements_general.service";
import { announcementsGroupService } from "../Announcements/Group/announcements_group.service";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { announcementsPersonalService } from "../Announcements/Personal/announcements_personal.service";

@Injectable()
export class parentService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly auth: authService,
        private readonly generalAnnoun: announcementsGeneralService,
        private readonly groupAnnoun: announcementsGroupService,
        private readonly swap: uuidSwapService,
        private readonly personal: announcementsPersonalService
    ){}

    ///// CRUD PARENTS
    async createParentLogin(school_id: string, email: string, password: string) {
        const {data, error} = await this.supabaseAdmin.db.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            app_metadata: {role: 'parent', status: 'active', school_id: school_id}
        })

        if(error) throw new InternalServerErrorException  (error.message)
        return data

    }

    async changeParentInfo(school_id: string, id: string, name?: string, phone?: string) {
        const updates: Record <string, any> = {}
        if(name !== undefined) updates.name = name
        if(phone !== undefined) updates.phone_number = phone

        const {data, error} = await this.supabase.db.from('Parents')
        .update(updates as any)
        .eq('id', id)
        .eq('school_id', school_id)


        if(error) throw new InternalServerErrorException  (error.message)
        return data

    }

    async changeParentPassword (school_id: string, id: string, password: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            password: password
        })

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async changeParentEmail (school_id: string, id: string, email: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            email: email
        })

        const {data: regdata, error: regerror} = await this.supabase.db.from('Parents')
        .update({email: email})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        if(regerror) throw new InternalServerErrorException  (regerror.message)
        return data && regdata
    }

    async deleteParent (school_id: string, id: string) {
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const { error} = await this.supabase.db.from('Parents')
        .update({status: 'inactive'})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) {
            throw new InternalServerErrorException (error.message)
        } else {
                const{error: nerror} = await this.supabaseAdmin.db.auth.admin.updateUserById(user_id, {
                app_metadata: {status: 'inactive'},
                ban_duration: '90000h'

            })

            if(nerror) throw new InternalServerErrorException (nerror.message)
        }
    }

    async getInactiveParents (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Parents')
        .select('*')
        .eq('school_id', school_id)
        .eq('status', 'inactive')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async UndoDeleteParent (school_id: string, id: string) {
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {data, error} = await this.supabase.db.from('Parents')
        .update({status: 'active'})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) {
            throw new InternalServerErrorException  (error.message)
        } else {
                const{error: nerror, data: ndata} = await this.supabaseAdmin.db.auth.admin.updateUserById(user_id, {
                app_metadata: {status: 'active'},
                ban_duration: 'none'

            })

            await this.supabaseAdmin.db.rpc('delete_user_sessions', {
                target_user_id: user_id
            })

            if(nerror) throw new InternalServerErrorException  (nerror.message)
            return data && ndata
        }
    }

    async getParentProfile(school_id: string, id: string) {
        const {data, error} = await this.supabase.db.from('Parents')
        .select('*')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async getParents(school_id: string) {
        const {data, error} = await this.supabase.db.from('Parents')
        .select('*')
        .eq('status', 'active')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }




    
    
    //// PARENT PERSONAL EDIT
    async changeEmail(school_id: string, id: string, current_email: string, new_email: string, token: string) {
        const verifiedOTP = await this.auth.verifyOTP(current_email, token)
        if(!verifiedOTP) throw new InternalServerErrorException  ('Invalid OTP')

        const user_id = await this.swap.swapUUID(school_id, id)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            email: new_email
        })

        const {data: RegularData, error: RegularError} = await this.supabase.db.from('Parents')
        .update({email: new_email})
        .eq('id', user_id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        if(RegularError) throw new InternalServerErrorException  (RegularError.message)
        return data && RegularData
    }

    async changePassword(id: string, email: string, current_password: string, new_password: string) {
        const verifiedPassword = await this.auth.verifyPassword(email, current_password)
        if(!verifiedPassword) throw new InternalServerErrorException  ("Invalid Password")

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            password: new_password
        })

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async changeInfo(school_id: string, id: string, name?: string, phone?: string) {
        const updateData: Record <string, any> = {}
        if(name !== undefined) updateData.name = name
        if(phone !== undefined) updateData.phone_number = phone

        const {data, error} = await this.supabase.db.from('Parents')
        .update(updateData as any)
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
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
            .from('Parents')
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
        .from('Parents')
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
        .from('Parents')
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
            .from('Parents')
            .update({
                pfp_path: null
            })
            .eq('id', id)
            .eq('school_id', school_id)

            if(error) throw new InternalServerErrorException  (error.message)
            return data && odata
        }
    }

    async getMyChild (school_id: string, parent_id: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
        .select('*')
        .eq('school_id', school_id)
        .eq('parents_id', parent_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async fetchGeneralAnnouncements (school_id: string) {
        return await this.generalAnnoun.getAll(school_id)
    }

    async fetchPersonalAnnouncements (school_id: string, student_id: string) {
        return await this.personal.getAllPersonalForPerson(school_id, student_id)
    }


    async fetchForParentGroup (school_id: string) {
        return await this.groupAnnoun.getAllForGroup(school_id, 'parents')
    }

}