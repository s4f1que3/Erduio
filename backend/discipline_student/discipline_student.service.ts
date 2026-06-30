import { supabaseService } from "supabase_service/supabase.service";
import { Injectable } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class disciplineService {

    constructor(
        private readonly supabase: supabaseService,
    ){}

    async disciplineStudent (school_id: string, disciplined_by: string, student_id: string, action: string, message: string, date: string) {
        const {data, error} = await this.supabase.db
        .from('Student_Discipline')
        .upsert({
            school_id: school_id,
            disciplined_by: disciplined_by,
            student_id: student_id,
            action: action,
            message: message,
            date: date
        })

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async updateDiscipline (school_id: string, record_id: string, belongs_to: string, student_id: string, action: string, message: string, date: string) {
        const {data, error} = await this.supabase.db
        .from('Student_Discipline')
        .update({
            school_id: school_id,
            disciplined_by: belongs_to,
            student_id: student_id,
            action: action,
            message: message,
            date: date
        })
        .eq('school_id', school_id)
        .eq('id', record_id)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async deleteDiscipline (school_id: string, discipline_id: string) {
        const {error} = await this.supabase.db
        .from('Student_Discipline')
        .delete()
        .eq('school_id', school_id)
        .eq('id', discipline_id)

        if(error) throw new InternalServerErrorException  (error.message)
    }

    async getStudentDisciplineRecords (school_id: string, student_id) {
        const {data, error} = await this.supabase.db
        .from('Student_Discipline')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async getMyDisciplines (school_id: string, teacher_id: string) {
        const {data, error} = await this.supabase.db
        .from('Student_Discipline')
        .select('*')
        .eq('school_id', school_id)
        .eq('disciplined_by', teacher_id)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async getAllDisciplines (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Student_Discipline')
        .select('*')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }

    async searchStudentsByName (school_id: string, name: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
        .select('id, name')
        .eq('school_id', school_id)
        .eq('status', 'active')
        .ilike('name', `%${name}%`)

        if(error) throw new InternalServerErrorException  (error.message)
        return data
    }





}