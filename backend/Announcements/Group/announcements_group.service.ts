import { supabaseService } from "../../supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { termsService } from "../../terms/terms.service";

@Injectable()
export class announcementsGroupService {

    constructor(
        private readonly supabase: supabaseService,
    ){}

    async createGroupAnnouncement(school_id: string, title: string, target: string, content: string, upload?: Express.Multer.File) {
        if(upload) {
            const path = `${school_id}/announcement-group/${crypto.randomUUID()}`
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .upload(path, upload.buffer, {contentType: upload.mimetype})

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcements_group')
                .insert({
                    school_id: school_id,
                    title: title,
                    content: content,
                    target: target,
                    upload_url: path,
                })

                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcements_group')
            .insert({
                school_id: school_id,
                title: title,
                content: content,
                target: target,
                upload_url: null,
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getFilePath (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_group')
        .select('upload_url')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('No file exists')
        return data.upload_url
    }

    async deleteGroupAnnouncement(school_id: string, announcement_id: string, group: string) {
        const path = await this.getFilePath(school_id, announcement_id)
        if(path) {
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .remove(path as any)

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcements_group')
                .delete()
                .eq('school_id', school_id)
                .eq('id', announcement_id)
                .eq('target', group)


                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcements_group')
            .delete()
            .eq('school_id', school_id)
            .eq('id', announcement_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getAllGroupAnnouncements (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_group')
        .select('*')
        .eq('school_id', school_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAllForGroup (school_id: string, group: string) {
        const {data, error} = await this.supabase.db
        .from('Announcements_group')
        .select('*')
        .eq('school_id', school_id)
        .eq('target', group)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getSignedUrl (school_id: string, assignment_id: string) {
        const path = await this.getFilePath(school_id, assignment_id)
        const {data, error} = await this.supabase.db.storage
        .from('announcements')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('Failed to generate signed URL')
        return data.signedUrl
    }


}