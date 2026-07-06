import { supabaseService } from "../supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import "multer"

@Injectable()
export class classesService {
    constructor(
        private readonly supabase: supabaseService,
    ){}


    async getClasses (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .select('*')
        .eq('school_id', school_id)
        .eq('status', 'active')

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    ///// CRUD CLASSES
    async createClass(school_id: string, subjects: {teacher_id: string, name: string }[], name: string, class_teacher: string, timetable: Express.Multer.File) {

        if(timetable) {
            const path = `${school_id}/${name}/timetable/${crypto.randomUUID()}`
            const {data: fdata, error: ferror} = await this.supabase.db.storage
            .from('timetables')
            .upload(path, timetable.buffer, {contentType: timetable.mimetype})

            if(ferror) throw new InternalServerErrorException(ferror.message)

            const {data, error} = await this.supabase.db.from('Classes')
            .insert({
                name: name,
                status: 'active',
                timetable_path: path,
                school_id: school_id,
                class_teacher_id: class_teacher
            })
            .select('id')
            .single()

            if(error) throw new InternalServerErrorException(error.message)
            await this.addClassSubjects(school_id, data.id, subjects)


        } else {
            const {data, error} = await this.supabase.db.from('Classes')
            .insert({
                name: name,
                status: 'active',
                school_id: school_id,
                class_teacher_id: class_teacher
            })
            .select('id')
            .single()

            if(error) throw new InternalServerErrorException(error.message)
            await this.addClassSubjects(school_id, data.id, subjects)
        }

    }

    async addClassSubjects (school_id: string, class_id: string, subjects: { teacher_id: string, name: string }[]) {
        const rows = subjects.map(sbjs => ({
            class_id: class_id,
            teacher_id: sbjs.teacher_id,
            school_id: school_id,
            name: sbjs.name
        }))

        const{data, error} = await this.supabase.db
        .from('Class_Subjects')
        .insert(rows)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async updateSubject(school_id: string, subject_id: string, name?: string, teacher_id?: string) {
        const updates: Record<string, any> = {}
        if (name !== undefined) updates.name = name
        if (teacher_id !== undefined) updates.teacher_id = teacher_id

        const { data, error } = await this.supabase.db
        .from('Class_Subjects')
        .update(updates as any)
        .eq('id', subject_id)
        .eq('school_id', school_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async changeClassTeacher(school_id: string, class_id: string, teacher_id: string) {
        const{data, error} = await this.supabase.db
        .from('Classes')
        .update({
            class_teacher_id: teacher_id,
        })
        .eq('school_id', school_id)
        .eq('id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }


    async changeTimeTableForClass(school_id: string, class_id: string, timetable: Express.Multer.File) {
        const path = `${school_id}/${class_id}/${crypto.randomUUID()}`
        const{data, error} = await this.supabase.db
        .storage
        .from('timetables')
        .upload(path, timetable.buffer, {contentType: timetable.mimetype})

        if(error) {
            throw new InternalServerErrorException(error.message)
        } else {
            const {data: rdata, error: rerror} = await this.supabase.db
            .from('Classes')
            .update({
                timetable_path: path
            })
            .eq('school_id', school_id)
            .eq('id', class_id)

            if(rerror) throw new InternalServerErrorException(rerror.message)
            return rdata && data
        }
        
    }

    async changeClassName (school_id: string, class_id: string, name: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .update({
            name: name
        })
        .eq('school_id', school_id)
        .eq('id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async removeClassTeacher(school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .update({
            class_teacher_id: null
        })
        .eq('school_id', school_id)
        .eq('id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getClassInfo(school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .select('id, name, class_teacher_id, timetable_path')
        .eq('school_id', school_id)
        .eq('id', class_id)
        .single()

        if (error) throw new InternalServerErrorException(error.message)
        if (!data) throw new NotFoundException('Class not found')

        let class_teacher_name: string | null = null
        if (data.class_teacher_id) {
            const {data: teacher, error: teacherError} = await this.supabase.db
            .from('Teachers')
            .select('name')
            .eq('school_id', school_id)
            .eq('id', data.class_teacher_id)
            .maybeSingle()

            if (teacherError) throw new InternalServerErrorException(teacherError.message)
            class_teacher_name = teacher?.name ?? null
        }

        return {
            id: data.id,
            name: data.name,
            class_teacher_id: data.class_teacher_id,
            class_teacher_name,
            has_timetable: !!data.timetable_path,
        }
    }

    async getSubjectsForClass(school_id: string, class_id: string) {
        const { data, error } = await this.supabase.db
        .from('Class_Subjects')
        .select('id, name, teacher_id')
        .eq('school_id', school_id)
        .eq('class_id', class_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentsForClass(school_id: string, class_id: string) {
        const { data, error } = await this.supabase.db
        .from('Students')
        .select('id, name')
        .eq('school_id', school_id)
        .eq('class_id', class_id)
        .eq('status', 'active')

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentsForSubject(school_id: string, subject_id: string) {
        const { data: links, error: linksError } = await this.supabase.db
        .from('Student_Subjects')
        .select('students_id')
        .eq('school_id', school_id)
        .eq('subjects_id', subject_id)

        if (linksError) throw new InternalServerErrorException(linksError.message)

        const studentIds = (links ?? []).map(row => row.students_id).filter(Boolean) as string[]
        if (studentIds.length === 0) return []

        const { data, error } = await this.supabase.db
        .from('Students')
        .select('*')
        .eq('school_id', school_id)
        .in('id', studentIds)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async deleteSubjectsFromClass(school_id: string, class_id: string, subjectsIDs: string[]) {
        const{data, error} = await this.supabase.db
        .from('Class_Subjects')
        .delete()
        .eq('school_id', school_id)
        .eq('class_id', class_id)
        .in('id', subjectsIDs)

        if(error) throw new InternalServerErrorException(error.message)
        return data

    }

    async deleteTimeTableForClass(school_id: string, class_id: string, path: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .delete()
        .eq('timetable_path', path)
        .eq('school_id', school_id)
        .eq('id', class_id)

        if(error) throw new InternalServerErrorException(error.message)

        const{data: fdata, error: ferror} = await this.supabase.db.storage.from('timetables')
        .remove(path as any)

        if(ferror) throw new InternalServerErrorException(ferror.message)
        return fdata && data
    }

    async deleteClass (school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .update({
            status: 'inactive'
        })
        .eq('id', class_id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data

    }

    async undoDeleteClass(school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .update({
            status: 'active'
        })
        .eq('id', class_id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getFilePath(school_id: string, class_id) {
        const {data, error} = await this.supabase.db
        .from('Classes')
        .select('timetable_path')
        .eq('school_id', school_id)
        .eq('id', class_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.timetable_path) throw new NotFoundException('Timetable file path not found')
        return data.timetable_path
    }

    async getSignedUrl(school_id: string, class_id: string) {
        const path = await this.getFilePath(school_id, class_id)
        const {data, error} = await this.supabase.db.storage
        .from('timetables')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('Failed to generate signed URL')
        return data.signedUrl
    }


}