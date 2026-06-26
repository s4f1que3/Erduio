import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { supabaseService } from "supabase_service/supabase.service";

@Injectable()
export class examService {
    constructor(private readonly supabase: supabaseService){}

    async createExam (school_id: string, subject_id: string, name: string, content: string, file?: Express.Multer.File) {
        if(file) {
            const path = `${school_id}/exam/${name}/${crypto.randomUUID()}`
            const {data: fdata, error: ferror} = await this.supabase.db.storage
            .from('exams')
            .upload(path, file.buffer, {contentType: file.mimetype})
            if(ferror) throw new InternalServerErrorException(ferror.message)
            
            const {data, error} = await this.supabase.db
            .from('Exams')
            .insert({
                name: name,
                content: content,
                file_path: path,
                subject_id: subject_id,
                school_id: school_id
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data && fdata
        } else { 
            const {data, error} = await this.supabase.db
            .from('Exams')
            .insert({
                name: name,
                content: content,
                subject_id: subject_id,
                school_id: school_id
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getAllExams (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Exams')
        .select('*')
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAllExamsForSubject (school_id: string, subject_id: string) {
        const {data, error} = await this.supabase.db
        .from('Exams')
        .select('*')
        .eq('school_id', school_id)
        .eq('subject_id', subject_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async updateInfo(school_id: string, exam_id: string, name?: string, content?: string) {
        const updates: Record <any, string> = {}
        if(name !== undefined) updates.name = name
        if (content !== undefined) updates.content = content

        const {data, error} = await this.supabase.db
        .from('Exams')
        .update(updates as any)
        .eq('school_id', school_id)
        .eq('id', exam_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async deleteExam (school_id: string, exam_id: string) {
        const path = await this.getFilePath(school_id, exam_id)

        if(path !== null) {
            const {error: ferror} = await this.supabase.db.storage
            .from('exams')
            .remove(path as any)
            if(ferror) throw new InternalServerErrorException(ferror.message)
            
            const {error} = await this.supabase.db
            .from('Exams')
            .delete()
            .eq('school_id', school_id)
            .eq('id', exam_id)

            if(error) throw new InternalServerErrorException(error.message)

        } else {
            const {error} = await this.supabase.db
            .from('Exams')
            .delete()
            .eq('school_id', school_id)
            .eq('id', exam_id)

            if(error) throw new InternalServerErrorException(error.message)
        }
    }

    async getFilePath (school_id: string, exam_id: string) {
        const {data, error} = await this.supabase.db
        .from('Exams')
        .select('file_path')
        .eq('school_id', school_id)
        .eq('id', exam_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.file_path) throw new NotFoundException('No file for this exam')
        return data.file_path
    }

    async viewFile (school_id: string, exam_id: string) {
        const path = await this.getFilePath(school_id, exam_id)
        const {data, error} = await this.supabase.db.storage
        .from('exams')
        .createSignedUrl(path as string, 60 * 60)
        
        if(error) throw new InternalServerErrorException(error.message)
        return data.signedUrl
    }


    //// this is for the controller
    async getSubjectId (school_id: string, exam_id: string) {
        const {data, error} = await this.supabase.db
        .from('Exams')
        .select('subject_id')
        .eq('school_id', school_id)
        .eq('id', exam_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.subject_id) throw new NotFoundException('No subject id foud')
        return data.subject_id
    }
}