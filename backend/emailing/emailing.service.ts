import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { supabaseService } from '../supabase_service/supabase.service'
import { Email } from './email.class'
import { buildSchoolMessageEmail } from './email.template'

@Injectable()
export class emailingService {

    constructor(private readonly email: Email, private readonly supabase: supabaseService){}


    // getters
    async getClassEmails (school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
        .select('email')
        .eq('school_id', school_id)
        .eq('class_id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        
        const studentEmails = (data ?? []).map(s => s.email).filter(Boolean) as string[]

        return studentEmails
    }

    async getSubjectEmails (school_id: string, subject_id: string) {
        const {data, error} = await this.supabase.db
        .from('Student_Subjects')
        .select('students_id')
        .eq('school_id', school_id)
        .eq('subjects_id', subject_id)

        if(error) throw new InternalServerErrorException(error.message)
        
        const studentIds= (data ?? []).map(s => s.students_id).filter(Boolean) as string[]

        const {data: sdata, error: serror} = await this.supabase.db
        .from('Students')
        .select('email')
        .eq('school_id', school_id)
        .in('id', studentIds)

        if(serror) throw new InternalServerErrorException(serror.message)
        
        const studentEmails = (sdata ?? []).map(s => s.email).filter(Boolean) as string []

        return studentEmails
    }

    async studentAndParentEmail (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
        .select('email, parents_id')
        .eq('school_id', school_id)
        .eq('id', student_id)

        if(error) throw new InternalServerErrorException(error.message)
        const student_email= (data ?? []).map(s => s.email).filter(Boolean) as string[]
        const parent_id = (data ?? []).map(p => p.parents_id).filter(Boolean) as string[]

        const {data: pdata, error: perror} = await this.supabase.db
        .from('Parents')
        .select('email')
        .eq('school_id', school_id)
        .in('id', parent_id)
        .maybeSingle()

        if(perror) throw new InternalServerErrorException(perror.message)
        if(!pdata?.email) throw new NotFoundException('No email for parent found')
        const parent_email = (pdata ?? []).email
        
        
        return { student_email, parent_email}
        
    }

    async schoolEmail (school_id: string) {
        const { data, error} = await this.supabase.db
        .from('Schools')
        .select('email')
        .eq('id', school_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.email) throw new NotFoundException('No school email')
        return data.email
    }

    async getUserEmail (school_id: string, id: string | null) {
        if(!id) throw new InternalServerErrorException  ('id is required')
        const roleTables = ['Super_Admins', 'Admins', 'Teachers', 'Parents', 'Students'] as const

        const results = await Promise.all(
            roleTables.map((roleTable) =>
                this.supabase.db
                .from(roleTable)
                .select('email')
                .eq('school_id', school_id)
                .eq('id', id)
                .maybeSingle()
            )
        )

        for (const { data, error } of results) {
            if (error) throw new InternalServerErrorException (error.message)
            if (data?.email) return data.email
        }

        throw new InternalServerErrorException ('user email not found in any table')
    }






    async sendEmail (message: string, subject: string, id: string) {
        const school_email = await this.schoolEmail(id)
        return await this.email.mail.sendMail({
            from: process.env.EMAIL_SENDER,
            replyTo: school_email,
            to: 'safiquesamuel95c@gmail.com',
            subject: subject,
            text: message,
            html: buildSchoolMessageEmail(subject, message, school_email)
        })
    }

    async sendEmailToUser (message: string, subject: string, school_id: string, opts?: {user_id?: string, email?: string}) {
        if(opts?.user_id) {
            const user_email = await this.getUserEmail(school_id, opts?.user_id)
            const school_email = await this.schoolEmail(school_id)
            return await this.email.mail.sendMail({
                from: process.env.EMAIL_SENDER,
                replyTo: school_email,
                to: user_email,
                subject: subject,
                text: message,
                html: buildSchoolMessageEmail(subject, message, school_email)
            })
        } else {
            const school_email = await this.schoolEmail(school_id)
            return await this.email.mail.sendMail({
                from: process.env.EMAIL_SENDER,
                replyTo: school_email,
                to: opts?.email,
                subject: subject,
                text: message,
                html: buildSchoolMessageEmail(subject, message, school_email)
            })
        }
    }

    async sendSubjectEmail (message: string, subject: string, subject_id: string, school_id: string) {
        const school_email = await this.schoolEmail(school_id)
        const emails = await this.getSubjectEmails(school_id, subject_id)

        return await this.email.mail.sendMail({
            from: process.env.EMAIL_SENDER,
            replyTo: school_email,
            bcc: emails,
            subject: subject,
            text: message,
            html: buildSchoolMessageEmail(subject, message, school_email)
        })
    }

    async sendClassEmail (message: string, subject: string, subject_id: string, school_id: string) {
        const school_email = await this.schoolEmail(school_id)
        const emails = await this.getSubjectEmails(school_id, subject_id)

        return await this.email.mail.sendMail({
            from: process.env.EMAIL_SENDER,
            replyTo: school_email,
            bcc: emails,
            subject: subject,
            text: message,
            html: buildSchoolMessageEmail(subject, message, school_email)
        })
    }

    async sendToStudentAndParent (message: string, subject: string, school_id: string, student_id: string) {
        const { student_email, parent_email } = await this.studentAndParentEmail(school_id, student_id)
        const emails = Array.from(new Set([...student_email, parent_email].filter(Boolean))) as string[]
        const school_email = await this.schoolEmail(school_id)

        return await this.email.mail.sendMail({
            from: process.env.EMAIL_SENDER,
            replyTo: school_email,
            bcc: emails,
            subject: subject,
            text: message,
            html: buildSchoolMessageEmail(subject, message, school_email)
            
        })
    }


    
}