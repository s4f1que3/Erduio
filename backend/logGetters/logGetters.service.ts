import { supabaseService } from "supabase_service/supabase.service";
import { Injectable } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class logGetterService {

    constructor(private readonly supabase: supabaseService){}

     async getTable( role: any): Promise<any> {
            if(role === 'admin') {
                return 'Admins'
            } else if(role === 'super_admin') {
                return 'Super_Admins'
            } else if(role === 'teacher') {
                return 'Teachers'
            }
        }
    
        async getParentID (school_id: string, student_id: string) {
            const {data, error} = await this.supabase.db
            .from('Students')
            .select('parents_id')
            .eq('school_id', school_id)
            .eq('user_id', student_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data.parents_id) return null
    
            const {data: parentData, error: parentError} = await this.supabase.db
            .from('Parents')
            .select('user_id')
            .eq('id', data.parents_id)
            .single()
    
            if(parentError) throw new InternalServerErrorException(parentError.message)
            return parentData.user_id
        }
    
        async getName (school_id: string, table: string, id: string): Promise <any> {
           const {data, error} = await this.supabase.db
            .from(table as any)
            .select('name')
            .eq('user_id', id)
            .eq('school_id', school_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data) throw new NotFoundException(`No record found in ${table}`)
            const row = data as unknown as { name: string } | null
            if(!row?.name) throw new NotFoundException(`No record found in ${table}`)
            return row.name
        }
    
        async getStudentName (school_id: string, id: string): Promise <any> {
           const {data, error} = await this.supabase.db
            .from('Students')
            .select('name')
            .eq('id', id)
            .eq('school_id', school_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.name) throw new NotFoundException('Student not found')
            return data.name
        }
    
        async getTeacherName (school_id: string, assignment_id: string) {
            const {data, error} = await this.supabase.db
            .from('Assignments')
            .select('teacher_id')
            .eq('school_id', school_id)
            .eq('id', assignment_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.teacher_id) throw new NotFoundException('Assignment not found')
    
            const{data: ndata, error: nerror} = await this.supabase.db
            .from('Teachers')
            .select('name')
            .eq('id', data?.teacher_id)
            .eq('school_id', school_id)
            .single()
    
            if(nerror) throw new InternalServerErrorException(nerror.message)
            if(!ndata?.name) throw new NotFoundException('Teacher not found')
            return ndata.name
        }
    
        async getClass (school_id: string, class_id: string) {
            const{data, error} = await this.supabase.db
            .from('Classes')
            .select('name')
            .eq('id', class_id)
            .eq('school_id', school_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.name) throw new NotFoundException('Class not found')
            return data.name
    
        }
    
        async getTeacherId (school_id: string, assignment_id: string) {
            const {data, error} = await this.supabase.db
            .from('Assignments')
            .select('teacher_id')
            .eq('school_id', school_id)
            .eq('id', assignment_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.teacher_id) throw new NotFoundException('Assignment not found')
            return data.teacher_id
        }
    
    
        async getAdminName (school_id: string, id: string): Promise <any> {
           const {data, error} = await this.supabase.db
            .from('Admins')
            .select('name')
            .eq('id', id)
            .eq('school_id', school_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.name) throw new NotFoundException('Admin not found')
            return data.name
        }
    
    
        async getSubjectname (school_id: string, subject_id: string) {
            const {data, error} = await this.supabase.db
            .from('Class_Subjects')
            .select('name')
            .eq('school_id', school_id)
            .eq('id', subject_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.name) throw new NotFoundException('Subject not found')
            return data.name
        }
    
        async getAssignmentName(school_id: string, assignment_id: string) {
            const {data, error} = await this.supabase.db
            .from('Assignments')
            .select('name')
            .eq('school_id', school_id)
            .eq('id', assignment_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.name) throw new NotFoundException('Assignment not found')
            return data.name
        }
    
        async getSubjectId (school_id: string, assignment_id: string) {
            const {data, error} = await this.supabase.db
            .from('Assignments')
            .select('subject_id')
            .eq('id', assignment_id)
            .eq('school_id', school_id)
            .single()
    
            if(error) throw new InternalServerErrorException(error.message)
            if(!data?.subject_id) throw new NotFoundException('Assignment not found')
            return data.subject_id
        }
}