import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { supabaseService } from "../supabase_service/supabase.service";
import { supabaseAdminService } from "../supabaseAdminService/supabase_admin.service";
import { authService } from "../auth/auth.service";
import { announcementsGeneralService } from "../Announcements/General/announcements_general.service";
import { announcementsClassService } from "../Announcements/Class/announcement_class.service";
import { announcementsGroupService } from "../Announcements/Group/announcements_group.service";
import { uuidSwapService } from "../pipes/transformuuid.pipe";
import { announcementsPersonalService } from "../Announcements/Personal/announcements_personal.service";
import { emailingService } from "../emailing/emailing.service";
import { LoggingService } from "../logging services/logging.service";

@Injectable()
export class studentService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly supabaseAdmin: supabaseAdminService,
        private readonly auth: authService,
        private readonly generalAnnoun: announcementsGeneralService,
        private readonly studentAnnoun: announcementsPersonalService,
        private readonly classAnnoun: announcementsClassService,
        private readonly groupAnnoun: announcementsGroupService,
        private readonly swap: uuidSwapService,
        private readonly email: emailingService,
        private readonly logging: LoggingService
    ){}

    //// STUDENT CRUD
    async createStudentWithNewParent(
        parent_name:string, 
        parent_phone: string, 
        student_password:string, 
        subjects: string[],
        student_name:string, 
        classID: string,
        school_id: string,
        is_creating_parent_login: boolean,

        ///// optional
        student_phone?: string,
        student_email?: string,
        parent_email?: string, 
        parent_password?: string, 
    ) {
        const time = Date.now() + (24 * 60 * 60 * 1000)

        if(is_creating_parent_login === true) {

            const {data, error} = await this.supabaseAdmin.db.auth.admin.createUser({
                email: parent_email,
                password: parent_password,
                email_confirm: true,
                app_metadata: {role: 'parent', status: 'active', school_id: school_id, must_change: true, time_end: time}
            })

            if(error) {
                throw new InternalServerErrorException(error.message)
            } else {
                const {data: parentdata, error: parenterror} = await this.supabase.db.from('Parents')
                .insert({
                    user_id: data.user.id,
                    name: parent_name,
                    email: parent_email,
                    phone_number: parent_phone,
                    school_id: school_id,
                    status: 'active'
                })
                .select('id')
                .single()
                const parent_id = parentdata?.id

                if(parenterror) {
                    throw new InternalServerErrorException(parenterror.message)
                } else {
                    await this.email.sendEmailToUser(`Your Erduio account was just created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Your email: ${parent_email}, Password: ${parent_password}. Please note that this password expires 24hrs from now. You MUST! change this to your own password.`, 'Erduio account created!', school_id, {email: parent_email})
                    const {error: astudenterror, data: astudentdata} = await this.supabaseAdmin.db.auth.admin.createUser({
                        email: student_email,
                        password: student_password,
                        email_confirm: true,
                        app_metadata: {role: 'student', status: 'active', school_id: school_id, must_change: true, time_end: time}
                    })

                    if(astudenterror) {
                        throw new InternalServerErrorException(astudenterror.message)
                    } else {
                        await this.email.sendEmailToUser(`Your Erduio account was just created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Your email: ${parent_email}, Password: ${parent_password}. Please note that this password expires 24hrs from now. You MUST! change this to your own password.`, 'Erduio account created!', school_id, {email: student_email})
                        const {error: rstudenterror, data: rstudentdata} = await this.supabase.db.from('Students')
                        .insert({
                            name: student_name,
                            email: student_email,
                            phone_number: student_phone,
                            user_id: astudentdata.user.id,
                            parents_id: parent_id,
                            school_id: school_id,
                            status: 'active',
                            enrollment_status: 'enrolled'
                        })
                        .select('id')
                        .single()

                        if(rstudenterror) {
                            throw new InternalServerErrorException(rstudenterror.message)
                        } else {
                            await this.addStudentSubjects(school_id, rstudentdata.id, subjects)
                        }
                        return rstudentdata && astudentdata && parentdata && data

                    }
                }

            }
            
        } else {
        const {data, error} = await this.supabase.db.from('Parents')
            .insert({
                name: parent_name,
                phone_number: parent_phone,
                email: parent_email,
                school_id: school_id
            })

            if(error) {
                throw new InternalServerErrorException(error.message)
            } else {
                const {data: rstudentdata, error: rstudenterror} = await this.supabaseAdmin.db.auth.admin.createUser({
                    email: student_email,
                    password: student_password,
                    email_confirm: true,
                    app_metadata: {role: 'student', status: 'active', school_id: school_id, must_change: true, time_end: time}
                })

                if(rstudenterror) {
                    throw new InternalServerErrorException(rstudenterror.message)
                } else {
                    await this.email.sendEmailToUser(`Your Erduio account was just created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Your email: ${parent_email}, Password: ${parent_password}. Please note that this password expires 24hrs from now. You MUST! change this to your own password.`, 'Erduio account created!', school_id, {email: student_email})
                    const {error: studenterror, data: studentdata} = await this.supabase.db.from('Students')
                        .insert({
                        user_id: rstudentdata.user.id,
                        name: student_name,
                        email: student_email,
                        enrollment_status: 'enrolled',
                        class_id: classID,
                        phone_number: student_phone,
                        status: 'active',
                        school_id: school_id
                    })
                    .select('id')
                    .single()

                    if(studenterror) {
                        throw new InternalServerErrorException(studenterror.message)
                    } else {
                        await this.addStudentSubjects(school_id, studentdata.id, subjects)
                    }
                    return studentdata && data
                }
            }
        }
    }

    async createStudentWithExstingParent (
        email: string,
        password:string, 
        name:string, 
        school_id: string,
        class_id: string,
        parent_id: string,
        subjects: string[],

        ///// optional
        phone?: string,
    ) {
        const time = Date.now() + (24 * 60 * 60 * 1000)
        const{error, data} = await this.supabaseAdmin.db.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            app_metadata: {role: 'student', status: 'active', school_id: school_id, must_change: true, time_end: time}
        })

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
            await this.email.sendEmailToUser(`Your Erduio account was just created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Your email: ${email}, Password: ${password}. Please note that this password expires 24hrs from now. You MUST! change this to your own password.`, 'Erduio account created!', school_id, {email: email})
            const{data: studentdata, error: studenterror} = await this.supabase.db.from('Students')
            .insert({
                user_id: data.user.id,
                name: name,
                email: email,
                phone_number: phone,
                parents_id: parent_id,
                class_id: class_id,
                enrollment_status: 'enrolled',
                status: 'active',
                school_id: school_id
            })
            .select('id')
            .single()

            if(studenterror) {
                throw new InternalServerErrorException(studenterror.message)
            } else {
                await this.addStudentSubjects(school_id, studentdata.id, subjects)
            }

            return studentdata && data
        }
    }

    async changeStudentEmail(school_id: string, id: string, email: string) {
        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const{data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(auth_id, {
            email: email
        })

        const {data: regdata, error: regerror} = await this.supabase.db.from('Students')
        .update({email: email})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        if(regerror) throw new InternalServerErrorException(regerror.message)
        await this.email.sendEmailToUser(`Your email was changed to ${email} by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for any inquiries.`, 'Email changed', school_id, {email: email})
        return data && regdata
    }

    async addStudentSubjects(school_id: string, studentID: string, subjectIDs: string[]) {
    const rows = subjectIDs.map(subjects_id => ({
        students_id: studentID,
        subjects_id,
        school_id
    }))

    const { data, error } = await this.supabase.db.from('Student_Subjects')
        .upsert(rows, {
            onConflict: 'students_id, subjects_id',
            ignoreDuplicates: true
        })

    if (error) throw new InternalServerErrorException(error.message)
    return data
}

    async deleteStudentSubjects(school_id: string, id: string, subjectIDs: string[]) {
        const{error} = await this.supabase.db.from('Student_Subjects')
        .delete()
        .eq('students_id', id)
        .eq('school_id', school_id)
        .in('subjects_id', subjectIDs)

        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendEmailToUser(`Some of your subjects were deleted by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for any inquiries.`, 'Subjects deleted', school_id, {user_id: id})

    }

    async changeStudentPassowrd(school_id: string, id: string, password: string) {
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
        await this.email.sendEmailToUser(`Your password was changed by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for any inquiries.`, 'Password changed', school_id, {user_id: id})
        return data
    }

    async changeStudentClass(school_id: string, id: string, class_id: string, subjectIds: string[]) {
        const {error: classError} = await this.supabase.db.from('Students')
        .update({class_id})
        .eq('id', id)
        .eq('school_id', school_id)

        if(classError) throw new InternalServerErrorException(classError.message)

        const {error: delError} = await this.supabase.db.from('Student_Subjects')
        .delete()
        .eq('students_id', id)
        .eq('school_id', school_id)

        if(delError) throw new InternalServerErrorException(delError.message)

        if(subjectIds.length > 0) {
            const rows = subjectIds.map(subjects_id => ({
                students_id: id,
                subjects_id,
                school_id
            }))

            const {error: insError} = await this.supabase.db.from('Student_Subjects')
            .insert(rows)

            if(insError) throw new InternalServerErrorException(insError.message)
        }
        const name = await this.logging.getClassName(school_id, class_id)

        await this.email.sendEmailToUser(`You were added to a new class '${name}' by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for any inquiries.`, 'New class!', school_id, {user_id: id})
    }

    async changeStudentInfo(school_id: string, id: string, name?: string, phone?: string) {
        const updates: Record <string, any> = {}
        if(name !== undefined) updates.name = name
        if(phone !== undefined) updates.phone_number = phone
        const {data, error} = await this.supabase.db.from('Students')
        .update(updates as any)
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendEmailToUser(`Your ${updates.join(', ')} was changed by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for any inquiries.`, 'Info updated!', school_id, {user_id: id})
        return data

    }

    async changeStudentEnrollmentStatus(school_id: string, id: string, status: string) {
        const {data, error} = await this.supabase.db.from('Students')
        .update({enrollment_status: status})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendEmailToUser(`Your enrollment status was changed to ${status} by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for any inquiries.`, 'Status changed!', school_id, {user_id: id})
        return data
    }

    async deleteStudent(school_id: string, id: string) {
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {error} = await this.supabase.db.from('Students')
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

    async UndoDeleteStudent(school_id: string, id: string) {
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, id)
        const {error} = await this.supabase.db.from('Students')
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

    async getAllStudents (school_id: string) {
        const{data, error} = await this.supabase.db.
        from('Students')
        .select('*')
        .eq('school_id', school_id)
        .eq('status', 'active')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAllInactiveStudents (school_id: string) {
        const{data, error} = await this.supabase.db.
        from('Students')
        .select('*')
        .eq('school_id', school_id)
        .eq('status', 'inactive')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }







    ///// PERSONAL STUDENT ACTIONS
    async updateEmail (school_id: string, id: string, current_email: string, new_email: string, token: string) {
        const verifiedOTP = await this.auth.verifyOTP(current_email, token)
        if(!verifiedOTP) throw new UnauthorizedException("Invalid OTP")

        const user_id = await this.swap.swapUUID(school_id, id)

        const{data, error} = await this.supabaseAdmin.db.auth.admin.updateUserById(id, {
            email: new_email
        })

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
            const {data: ndata, error: nerror} = await this.supabase.db
            .from('Students')
            .update({
                email: new_email
            })
            .eq('id', user_id)
            .eq('school_id', school_id)

            if(nerror) throw new InternalServerErrorException(nerror.message)
            await this.email.sendEmailToUser(`Your email was changed from ${current_email} to ${new_email} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}.`, 'Email changed!', school_id, {email: new_email})
            return ndata && data
        }
    }

    async updatePassowrd (id: string, email: string, current_password: string, new_password: string) {
        const verifiedPassword = await this.auth.verifyPassword(email, current_password)
        if(!verifiedPassword) throw new UnauthorizedException("Invalid Passowrd")

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

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async updatePhoneNumber (school_id: string, id: string, phone: string, token: string) {
        const verifiedOTP = await this.auth.verifyOtpByPhone(phone, token)
        if(!verifiedOTP) throw new UnauthorizedException ("Invalid OTP")

        const {data, error} = await this.supabase.db.from('Students')
        .update({phone_number: phone})
        .eq('id', id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendEmailToUser(`Your phone number was changed to ${phone} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}.`, 'Phone number changed!', school_id, {user_id: id})
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
            .from('Students')
            .update({
                pfp_path: path
            })
            .eq('id', id)
            .eq('school_id', school_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data && pdata
        }
    }

    async deleteProfilePicture (school_id: string, id: string) {
        const {data: pdata, error: perror} = await this.supabase.db
        .from('Students')
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

    async showProfilePicture (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
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

    async getStudentSubjects (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Student_Subjects')
        .select('*')
        .eq('school_id', school_id)
        .eq('students_id', student_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentProfile (school_id: string, id: string) {
        const {data: student, error} = await this.supabase.db
        .from('Students')
        .select('*')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)

        const [classResult, subjectLinksResult, parentResult] = await Promise.all([
            student.class_id
                ? this.supabase.db.from('Classes').select('id, name').eq('id', student.class_id).eq('school_id', school_id).maybeSingle()
                : Promise.resolve({data: null, error: null}),
            this.supabase.db.from('Student_Subjects').select('subjects_id').eq('students_id', id).eq('school_id', school_id),
            student.parents_id
                ? this.supabase.db.from('Parents').select('id, name, email, phone_number, pfp_path').eq('id', student.parents_id).eq('school_id', school_id).maybeSingle()
                : Promise.resolve({data: null, error: null}),
        ])

        if(classResult.error) throw new InternalServerErrorException(classResult.error.message)
        if(subjectLinksResult.error) throw new InternalServerErrorException(subjectLinksResult.error.message)
        if(parentResult.error) throw new InternalServerErrorException(parentResult.error.message)

        const subjectIds = (subjectLinksResult.data ?? []).map(row => row.subjects_id).filter(Boolean) as string[]
        let subjects: {id: string, name: string | null}[] = []
        if(subjectIds.length > 0) {
            const {data: subjectsData, error: subjectsError} = await this.supabase.db
            .from('Class_Subjects')
            .select('id, name')
            .in('id', subjectIds)

            if(subjectsError) throw new InternalServerErrorException(subjectsError.message)
            subjects = subjectsData ?? []
        }

        return {
            ...student,
            class: classResult.data,
            subjects,
            parent: parentResult.data,
        }
    }

    async getStudentClass (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
        .select('class_id')
        .eq('school_id', school_id)
        .eq('id', student_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.class_id) throw new NotFoundException('Class not found for student')
        const {data: ndata, error: nerror} = await this.supabase.db
        .from('Classes')
        .select('name')
        .eq('school_id', school_id)
        .eq('id', data.class_id)
        .single()

        if(nerror) throw new InternalServerErrorException(nerror.message)
        return ndata.name
    }

    async fetchGeneralAnnouncements (school_id: string) {
        return await this.generalAnnoun.getAll(school_id)
    }


    // announcements sent to the specific student
    async fetchAllForStudent(school_id: string, student_id: string) {
        return await this.studentAnnoun.getAllPersonalForPerson(school_id, student_id)
    }


    async fetchForClassStudentIsIn(school_id: string, class_id: string) {
        return await this.classAnnoun.getAllForClass(school_id, class_id)
    }


    async fetchForStudentGroup (school_id: string) {
        return await this.groupAnnoun.getAllForGroup(school_id, 'students')
    }


}