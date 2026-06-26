import { supabaseService } from "supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { termsService } from "terms/terms.service";

@Injectable()
export class announcementsGeneralService {

    constructor(
        private readonly supabase: supabaseService, 
    ){}

    async createGeneralAnnouncement(school_id: string, title: string, content: string, upload?: Express.Multer.File) {
        if(upload) {
            const path = `${school_id}/announcement/${crypto.randomUUID()}`
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .upload(path, upload.buffer, {contentType: upload.mimetype})

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcements_general')
                .insert({
                    school_id: school_id,
                    title: title,
                    content: content,
                    upload_url: path,
                })

                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcements_general')
            .insert({
                school_id: school_id,
                title: title,
                content: content,
                upload_url: null,
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getFilePath (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_general')
        .select('upload_url')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('No file exists')
        return data.upload_url
    }

    async deleteGeneralAnnouncement(school_id: string, announcement_id: string) {
        const path = await this.getFilePath(school_id, announcement_id)
        if(path) {
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .remove(path as any)

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcements_general')
                .delete()
                .eq('school_id', school_id)
                .eq('id', announcement_id)


                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcements_general')
            .delete()
            .eq('school_id', school_id)
            .eq('id', announcement_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getAll (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_general')
        .select('*')
        .eq('school_id', school_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getFilePathIfExists (school_id: string, id: string): Promise<string | null> {
        const {data, error} = await this.supabase.db
        .from('Announcements_general')
        .select('upload_url')
        .eq('id', id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('Announcement file not found')
        return data.upload_url ?? null

    }

    async getSignedUrl (school_id: string, id: string) {
        const path = await this.getFilePathIfExists(school_id, id)
        const {data, error} = await this.supabase.db.storage
        .from('announcements')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('Failed to generate signed URL')
        return data.signedUrl
    }


}