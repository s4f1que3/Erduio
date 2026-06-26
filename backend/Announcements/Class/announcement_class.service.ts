import { supabaseService } from "supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

@Injectable()
export class announcementsClassService {

    constructor(
        private readonly supabase: supabaseService
    ){}

    async createClassAnnouncement(school_id: string, title: string, content: string, class_id: string, upload?: Express.Multer.File) {

        if(upload) {
            const path = `${school_id}/announcement-class/${crypto.randomUUID()}`
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .upload(path, upload.buffer, {contentType: upload.mimetype})

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcements_class')
                .insert({
                    school_id: school_id,
                    title: title,
                    content: content,
                    target_id: class_id,
                    upload_url: path,
                })

                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcements_class')
            .insert({
                school_id: school_id,
                title: title,
                content: content,
                target_id: class_id,
                upload_url: null
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getFilePath (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_class')
        .select('upload_url')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('No file exists')
        return data.upload_url
    }

    async deleteClassAnnouncement(school_id: string, announcement_id: string) {
        const path = await this.getFilePath(school_id, announcement_id)
        if(path) {
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .remove(path as any)

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcements_class')
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

    async getAll(school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_class')
        .select('*')
        .eq('school_id', school_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getSignedURL (school_id: string, assignment_id: string) {
        const path = await this.getFilePathIfExists(school_id, assignment_id)
        const {data, error} = await this.supabase.db.storage
        .from('announcements')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('signed URL not found')
        return data.signedUrl
    }

    async getAllForClass(school_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_class')
        .select('*')
        .eq('school_id', school_id)
        .eq('target_id', class_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getFilePathIfExists (school_id: string, id: string): Promise<string | null> {
        const {data, error} = await this.supabase.db
        .from('Announcements_class')
        .select('upload_url')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('upload_url not found for announcement')
        return data.upload_url ?? null

    }

    
}