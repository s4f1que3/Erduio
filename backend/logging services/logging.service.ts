import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"

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







    //// this is just my fetching for all my needs atp - will refactor later
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

    async getAssignmentName (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments')
        .select('name')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.name) throw new NotFoundException('No assignment name')
        return data.name
    }

    async getSubjectId (school_id: string, assignment_id: string) {
        const { data, error} = await this.supabase.db
        .from('Assignments')
        .select('subject_id')
        .eq('school_id', school_id)
        .eq('id', assignment_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.subject_id) throw new NotFoundException('No subject id found')
        return data.subject_id

    }

    async getSubjectName (school_id: string, subject_id: string) {
        const { data, error} = await this.supabase.db
        .from('Class_Subjects')
        .select('name')
        .eq('school_id', school_id)
        .eq('id', subject_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.name) throw new NotFoundException('No subject id found')
        return data.name

    }

    async getClassName (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .select('name')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.name) throw new NotFoundException('No class name found')
        return data.name
    }

    async getExamName (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Exams')
        .select('name')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.name) throw new NotFoundException('No exam name found')
        return data.name
    }

    async getSubjecIdFromExamId (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Exams')
        .select('subject_id')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.subject_id) throw new NotFoundException('No subject id for this exam found')
        return data.subject_id
    }

    async getNoteName (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Notes')
        .select('title')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.title) throw new NotFoundException('No title for this note found')
        return data.title
    }

    async getSubjectIdFromNote (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Notes')
        .select('subject_id')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.subject_id) throw new NotFoundException('No subject id for this note found')
        return data.subject_id
    }

    async getStudentIdFromReport (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Report_Cards')
        .select('student_id')
        .eq('school_id', school_id)
        .eq('id', id)
        .single()


        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.student_id) throw new NotFoundException('No student id for this report card found')
        return data.student_id
    }

}
