import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { supabaseService } from "supabase_service/supabase.service";
import { termsService } from "terms/terms.service";

@Injectable()
export class classAttendanceService {

    constructor(
        private readonly supabase: supabaseService,
    ){}

    async takeAttendance (school_id: string, class_id: string, date: string, teacher_id: string, records: {student_id: string, present: boolean}[]) {

        const {error: delError} = await this.supabase.db
        .from('Class_Attendance')
        .delete()
        .eq('school_id', school_id)
        .eq('class_id', class_id)
        .eq('date', date)

        if(delError) throw new InternalServerErrorException(delError.message)

        const rows = records.map(({ student_id, present}) => ({
            school_id,
            class_id,
            teacher_id,
            date,
            student_id,
            present
        }))

        const {data, error} = await this.supabase.db
        .from('Class_Attendance')
        .insert(rows)

        if(error) throw new InternalServerErrorException(error.message)
        return data

    }

    async getAllAttendancesForAClass(school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Class_Attendance')
        .select('*')
        .eq('school_id', school_id)
        .eq('class_id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getClassAttendancesForAClassForADate(school_id: string, class_id: string, date: string) {
        const {data, error} = await this.supabase.db
        .from('Class_Attendance')
        .select('*')
        .eq('school_id', school_id)
        .eq('class_id', class_id)
        .eq('date', date)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentAverage(school_id: string, student_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Class_Attendance')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)
        .eq('class_id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }
}
