import { supabaseService } from "../../supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { termsService } from "../../terms/terms.service";

@Injectable()
export class announcementsSubjectService {

    constructor(
        private readonly supabase: supabaseService, 
    ){}

    async createSubjectAnnouncement(school_id: string, title: string, content: string, subject_id: string, teacher_id: string, upload?: Express.Multer.File) {
        if(upload) {
            const path = `${school_id}/announcement-subject/${crypto.randomUUID()}`
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .upload(path, upload.buffer, {contentType: upload.mimetype})

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcement_subject')
                .insert({
                    school_id: school_id,
                    teacher_id: teacher_id,
                    subject_id: subject_id,
                    title: title,
                    message: content,
                    file_path: path,
                })

                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcement_subject')
            .insert({
                school_id: school_id,
                teacher_id: teacher_id,
                subject_id: subject_id,
                title: title,
                message: content,
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async createNewUpdateSubjectAnnouncement (school_id: string, subject_id: string, teacher_id: string, title: string, message: string) {
        const {data, error} = await this.supabase.db
        .from('Announcement_subject')
        .insert({
            school_id: school_id,
            subject_id: subject_id,
            teacher_id: teacher_id,
            title: title,
            message: message
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data

    }

    async createNewShortSubjectAnnouncement (school_id: string, subject_id: string, title: string, message: string) {
        const {data, error} = await this.supabase.db
        .from('Announcement_subject')
        .insert({
            school_id: school_id,
            subject_id: subject_id,
            title: title,
            message: message
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data

    }

    async getAll(school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcement_subject')
        .select('*')
        .eq('school_id', school_id)

        if (error) throw new InternalServerErrorException(error.message)
        if (!data || data.length === 0) return data

        const subjectIds = Array.from(new Set(data.map((a: any) => a.subject_id).filter(Boolean)))
        const {data: subjects, error: subjectsError} = await this.supabase.db
        .from('Class_Subjects')
        .select('id, name')
        .in('id', subjectIds)

        if (subjectsError) throw new InternalServerErrorException(subjectsError.message)
        const nameById = new Map((subjects ?? []).map(s => [s.id, s.name]))

        return data.map((a: any) => ({ ...a, subject_name: nameById.get(a.subject_id) ?? null }))
    }

    async getAllForSubject(school_id: string, subject_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcement_subject')
        .select('*')
        .eq('school_id', school_id)
        .eq('subject_id', subject_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getFilePathIfExists (school_id: string, id: string): Promise<string | null> {
        const {data, error} = await this.supabase.db
        .from('Announcement_subject')
        .select('file_path')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.file_path) throw new NotFoundException('Announcement file not found')
        return data.file_path ?? null

    }

     async deleteSubjectAnnouncement(school_id: string, announcement_id: string) {
        const path = await this.getFilePathIfExists(school_id, announcement_id)
        if(path) {
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .remove(path as any)

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcement_subject')
                .delete()
                .eq('school_id', school_id)
                .eq('id', announcement_id)


                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcements_class')
            .delete()
            .eq('school_id', school_id)
            .eq('id', announcement_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getSignedUrl (school_id: string, assignment_id: string) {
        const path = await this.getFilePathIfExists(school_id, assignment_id)
        const {data, error} = await this.supabase.db.storage
        .from('announcements')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('Failed to generate signed URL')
        return data.signedUrl
    }


}