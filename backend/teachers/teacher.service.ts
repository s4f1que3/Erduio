import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { authService } from "../auth/auth.service";
import { supabaseService} from "../supabase_service/supabase.service";
import { supabaseAdminService } from "../supabaseAdminService/supabase_admin.service";
import { announcementsGeneralService } from "../Announcements/General/announcements_general.service";
import { announcementsGroupService } from "../Announcements/Group/announcements_group.service";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { announcementsPersonalService } from "../Announcements/Personal/announcements_personal.service";
import { emailingService } from "../emailing/emailing.service";

@Injectable()
export class teacherService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly auth: authService,
        private readonly generalAnnoun: announcementsGeneralService,
        private readonly groupAnnoun: announcementsGroupService,
        private readonly swap: uuidSwapService,
        private readonly personal: announcementsPersonalService,
        private readonly email: emailingService
    ){}


    ///// CRUD TEACHERS ADMINS
    async createTeacher(school_id: string, email: string, password: string, name: string, phone: string) {
        const time = Date.now() + (24 * 60 * 60 * 1000)
        const {data, error} = await this.supabaseAdmin.db.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            app_metadata: {role: 'teacher', status: 'active', must_change: true, time_end: time},

        })

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
            await this.email.sendEmailToUser(`Your Erduio account was just created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Your email: ${email}, Password: ${password}. Please note that this password expires 24hrs from now. You MUST! change this to your own password.`, 'Erduio account created!', school_id, {email: email})
            await this.supabase.db.from('Teachers').insert({
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

    async changeTeacherInfo_SuperADMIN(school_id: string, id: string, name?: string, phone?: string) {
        const updates: Record <string, any> = {}
        if(name !== undefined) updates.name = name
        if(phone !== undefined) updates.phone_number = phone

        const {data, error} = await this.supabase.db.from('Teachers')
        .update(updates as any)
        .eq('id', id)
        .eq('school_id', school_id)


        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendEmailToUser(`Your ${updates.join(', ')} was just updated by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact the school admin for any inquiries.`, 'Account info changed!', school_id, {user_id: id})
        return data

    }

    async changeTeacherPassword_SuperADMIN (school_id: string, id: string, password: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {data: userData, error: userError} = await this.supabaseAdmin.db.auth.admin.getUserById(auth_id)
        if(userError) throw new InternalServerErrorException(userError.message)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            password: password,
            app_metadata: {
                ...userData.user?.app_metadata,
                must_change: false,
                time_end: null
            }
        })

        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendEmailToUser(`Your password was just changed by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact the school admin for any inquiries.`, 'Password changed!', school_id, {user_id: id})
        return data
    }

    async changeTeacherEmail_SuperADMIN (school_id: string, id: string, email: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            email: email
        })

        const {data: regdata, error: regerror} = await this.supabase.db.from('Teachers')
        .update({email: email})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        if(regerror) throw new InternalServerErrorException(regerror.message)
        await this.email.sendEmailToUser(`Your email was just changed by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact the school admin for any inquiries.`, 'Email changed!', school_id, {user_id: id})
        return data && regdata
    }

    async deleteTeacher (school_id: string, id: string) {
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {error} = await this.supabase.db.from('Teachers')
        .update({status: 'inactive'})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
                const{error: nerror} = await this.supabaseAdmin.db.auth.admin.updateUserById(user_id, {
                app_metadata: {status: 'inactive'},
                ban_duration: '90000h'

            })

            await this.supabaseAdmin.db.rpc('delete_user_sessions', {
                target_user_id: user_id
            })

            if(nerror) throw new InternalServerErrorException(nerror.message)
        }
    }

    async UndoDeleteTeacher (school_id: string, id: string) {
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {error} = await this.supabase.db.from('Teachers')
        .update({status: 'active'})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
                const{error: nerror} = await this.supabaseAdmin.db.auth.admin.updateUserById(user_id, {
                app_metadata: {status: 'active'},
                ban_duration: 'none'

            })

            if(nerror) throw new InternalServerErrorException(nerror.message)
        }
    }

    async getTeacherProfile (school_id: string, id: string) {
        const {data: teacher, error} = await this.supabase.db
        .from('Teachers')
        .select('*')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)

        const {data: subjects, error: subjError} = await this.supabase.db
        .from('Class_Subjects')
        .select('id, name, class_id')
        .eq('teacher_id', id)
        .eq('school_id', school_id)

        if(subjError) throw new InternalServerErrorException(subjError.message)

        const classIds = [...new Set((subjects ?? []).map(s => s.class_id).filter((cid): cid is string => !!cid))]
        let classes: {id: string, name: string | null}[] = []
        if(classIds.length > 0) {
            const {data: classData, error: classError} = await this.supabase.db
            .from('Classes')
            .select('id, name')
            .in('id', classIds)

            if(classError) throw new InternalServerErrorException(classError.message)
            classes = classData ?? []
        }

        const classNameById: Record<string, string | null> = Object.fromEntries(classes.map(c => [c.id, c.name]))
        const subjectsWithClass = (subjects ?? []).map(s => ({...s, class_name: s.class_id ? (classNameById[s.class_id] ?? null) : null}))

        return {
            ...teacher,
            subjects: subjectsWithClass,
        }
    }

    async getMyProfile (school_id: string, user_id: string) {
        const {data: teacherRow, error: teacherError} = await this.supabase.db
        .from('Teachers')
        .select('id')
        .eq('school_id', school_id)
        .eq('user_id', user_id)
        .single()

        if(teacherError || !teacherRow?.id) throw new InternalServerErrorException  (teacherError?.message ?? 'teacher not found')
        const id = teacherRow.id

        const {data: subjects, error: subjError} = await this.supabase.db
        .from('Class_Subjects')
        .select('id, name, class_id')
        .eq('teacher_id', id)
        .eq('school_id', school_id)

        if(subjError) throw new InternalServerErrorException  (subjError.message)

        const {data: homeroomClasses, error: classError} = await this.supabase.db
        .from('Classes')
        .select('id, name')
        .eq('class_teacher_id', id)
        .eq('school_id', school_id)
        .eq('status', 'active')

        if(classError) throw new InternalServerErrorException  (classError.message)

        const subjectClassIds = [...new Set((subjects ?? []).map(s => s.class_id).filter((cid): cid is string => !!cid))]
        let subjectClasses: {id: string, name: string | null}[] = []
        if(subjectClassIds.length > 0) {
            const {data: classData, error: subjectClassError} = await this.supabase.db
            .from('Classes')
            .select('id, name')
            .in('id', subjectClassIds)

            if(subjectClassError) throw new InternalServerErrorException  (subjectClassError.message)
            subjectClasses = classData ?? []
        }

        const classNameById: Record<string, string | null> = Object.fromEntries(subjectClasses.map(c => [c.id, c.name]))
        const subjectsWithClass = (subjects ?? []).map(s => ({...s, class_name: s.class_id ? (classNameById[s.class_id] ?? null) : null}))

        return {
            classes: homeroomClasses ?? [],
            subjects: subjectsWithClass,
        }
    }

    async AdmindeleteProfilePicture (school_id: string, path: string, id: string) {
        const {data: odata, error: oerror} = await this.supabase.db.storage
        .from('profile')
        .remove(path as any)

        if(oerror) {
            throw new InternalServerErrorException  (oerror.message)
        } else {
            const {data, error} = await this.supabase.db
            .from('Students')
            .update({
                pfp_path: null
            })
            .eq('id', id)
            .eq('school_id', school_id)

            if(error) throw new InternalServerErrorException  (error.message)
            return data && odata
        }
    }

    async getInactive (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Teachers')
        .select('*')
        .eq('school_id', school_id)
        .eq('status', 'inactive')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }










    /// PERSONAL
    async getTeachers(school_id: string) {
        const {data, error} = await this.supabase.db.from('Teachers')
        .select('*')
        .eq('status', 'active')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async changeEmail(school_id: string, id: string, current_email: string, new_email: string, token: string) {
        const verifiedOTP = await this.auth.verifyOTP(current_email, token)
        if(!verifiedOTP) throw new InternalServerErrorException  ('Invalid OTP')

        const user_id = await this.swap.swapUUID(school_id, id)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            email: new_email
        })

        const {data: RegularData, error: RegularError} = await this.supabase.db.from('Teachers')
        .update({email: new_email})
        .eq('id', user_id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        if(RegularError) throw new InternalServerErrorException  (RegularError.message)
        await this.email.sendEmailToUser(`Your email was just changed from ${current_email} to ${new_email} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}.`, 'Email changed!', school_id, {user_id: id})
        return data && RegularData
    }

    async changePassword(id: string, email: string, current_password: string, new_password: string) {
        const verifiedPassword = await this.auth.verifyPassword(email, current_password)
        if(!verifiedPassword) throw new InternalServerErrorException  ("Invalid Password")

        const {data: userData, error: userError} = await this.supabaseAdmin.db.auth.admin.getUserById(id)
        if(userError) throw new InternalServerErrorException(userError.message)

        const {data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            password: new_password,
            app_metadata: {
                ...userData.user?.app_metadata,
                must_change: false,
                time_end: null
            }
        })

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async changeInfo(school_id: string, id: string, name?: string, phone?: string) {
        const updateData: Record <string, any> = {}
        if(name !== undefined) updateData.name = name
        if(phone !== undefined) updateData.phone_number = phone

        const {data, error} = await this.supabase.db.from('Teachers')
        .update(updateData as any)
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        await this.email.sendEmailToUser(`Your ${updateData.join(', ')} was just updated by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact the school admin for any inquiries.`, 'Account info changed!', school_id, {user_id: id})
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
            .from('Teachers')
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
        .from('Teachers')
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
        .from('Teachers')
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
            .from('Teachers')
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

    async fetchPersonalAnnouncements (school_id: string, user_id: string) {
        return await this.personal.getAllPersonalForPerson(school_id, user_id)
    }


    async fetchForTeacherGroup (school_id: string) {
        return await this.groupAnnoun.getAllForGroup(school_id, 'teachers')
    }
}