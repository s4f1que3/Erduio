import { Injectable } from "@nestjs/common";
import { supabaseService } from "../../supabase_service/supabase.service";
import { InternalServerErrorException } from "@nestjs/common";
import { emailingService } from "../../emailing/emailing/emailing.service";
import { LoggingService } from "../../logging services/logging.service";

@Injectable()
export class examGradeService {

    constructor (
        private readonly supabase: supabaseService,
        private readonly email: emailingService,
        private readonly logging: LoggingService
    ){}

    async giveGrade (school_id: string, exam_id: string, student_id: string, grade: string, message?: string) {
        if(message) {
            const {data, error} = await this.supabase.db
            .from('Exam_Grades')
            .insert({
                exam_id: exam_id,
                student_id: student_id,
                school_id: school_id,
                grade: grade,
                message: message
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        } else {
            const {data, error} = await this.supabase.db
            .from('Exam_Grades')
            .upsert({
                exam_id: exam_id,
                student_id: student_id,
                school_id: school_id,
                grade: grade,
            }, {
                onConflict: 'school_id, exam_id, student_id',
                ignoreDuplicates: true
            })

            if(error) throw new InternalServerErrorException(error.message)
            const name = await this.logging.getExamName(school_id, exam_id)
            await this.email.sendToStudentAndParent(`You recieved a grade of ${grade} for the exam '${name}' on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}`, 'Exam grade recieved!', school_id, student_id)
            return data
        }
    }

    async updateGrade (school_id: string, grade_id: string, grade?: string, message?: string) {
        const updates: Record <any, string> = {}
        if(grade !== undefined) updates.grade = grade
        if(message !== undefined) updates.message = message

        const {data, error} = await this.supabase.db
        .from('Exam_Grades')
        .update(updates as any)
        .eq('school_id', school_id)
        .eq('id', grade_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async deleteGrade (school_id: string, grade_id: string) {
        const {error} = await this.supabase.db
        .from('Exam_Grades')
        .delete()
        .eq('school_id', school_id)
        .eq('id', grade_id)

        if(error) throw new InternalServerErrorException(error.message)
        
    }

    async getAllStudentsExamGrades (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Exam_Grades')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentsExamGradeForExam (school_id: string, student_id: string, exam_id: string) {
        const {data, error} = await this.supabase.db
        .from('Exam_Grades')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)
        .eq('exam_id', exam_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }
}