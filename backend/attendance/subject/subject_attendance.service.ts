import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { supabaseService } from "../../supabase_service/supabase.service";
import { LoggingService } from "../../logging services/logging.service";
import { emailingService } from "../../emailing/emailing/emailing.service";

@Injectable()
export class subjectAttendanceService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly logging: LoggingService,
        private readonly email: emailingService
    ){}

    async takeAttendance (school_id: string, subject_id: string, date: string, teacher_id: string, records: {student_id: string, present: boolean}[]) {

        const rows = records.map(({ student_id, present}) => ({
            school_id,
            subject_id,
            teacher_id,
            date,
            student_id,
            present
        }))

        const {data, error} = await this.supabase.db
        .from('Subject_Attendance')
        .upsert(rows, {
            onConflict: 'subject_id, student_id, date',
            ignoreDuplicates: false
        })

        if(error) throw new InternalServerErrorException(error.message)
        const absents = records.filter(r => !r.present)
        for(const {student_id} of absents) {
            const name = await this.logging.getSubjectName(school_id, subject_id)
            await this.email.sendToStudentAndParent(`You were absent on ${name}'s attendance today.`, "Absent on today's attendance!", school_id, student_id)
        }
        return data

    }

    async getAllAttendancesForASubject(school_id: string, subject_id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Attendance')
        .select('*')
        .eq('school_id', school_id)
        .eq('subject_id', subject_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getSubjectAttendancesForASubjectForADate(school_id: string, subject_id: string, date: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Attendance')
        .select('*')
        .eq('school_id', school_id)
        .eq('subject_id', subject_id)
        .eq('date', date)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentAverage(school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Attendance')
        .select('subject_id, present')
        .eq('school_id', school_id)
        .eq('student_id', student_id)

        if(error) throw new InternalServerErrorException(error.message)

        const bySubject = new Map<string, {present: number, total: number}>()
        for (const row of data ?? []) {
            if (!row.subject_id) continue
            const entry = bySubject.get(row.subject_id) ?? {present: 0, total: 0}
            entry.total += 1
            if (row.present) entry.present += 1
            bySubject.set(row.subject_id, entry)
        }

        const subjectIds = Array.from(bySubject.keys())
        if (subjectIds.length === 0) return []

        const {data: subjects, error: subjectsError} = await this.supabase.db
        .from('Class_Subjects')
        .select('id, name')
        .in('id', subjectIds)

        if(subjectsError) throw new InternalServerErrorException(subjectsError.message)

        const nameById = new Map((subjects ?? []).map(s => [s.id, s.name]))

        return subjectIds.map(subject_id => {
            const {present, total} = bySubject.get(subject_id)!
            return {
                subject_id,
                subject_name: nameById.get(subject_id) ?? subject_id,
                average: Math.round((present / total) * 100),
            }
        })
    }
}