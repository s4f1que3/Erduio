import { supabaseService } from "supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { termsService } from "terms/terms.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";

@Injectable()
export class announcementsPersonalService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly swap: uuidSwapService
    ){}

    async createPersonalAnnouncement(school_id: string, title: string, student_id: string, content: string, upload?: Express.Multer.File) {
        if(upload) {
            const path = `${school_id}/announcement-student/${crypto.randomUUID()}`
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .upload(path, upload.buffer, {contentType: upload.mimetype})

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcement_personal')
                .insert({
                    school_id: school_id,
                    title: title,
                    content: content,
                    target_id: student_id,
                    upload_url: path,
                })

                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcement_personal')
            .insert({
                school_id: school_id,
                title: title,
                content: content,
                target_id: student_id,
                upload_url: null,
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getFilePath (school_id: string, id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcement_personal')
        .select('upload_url')
        .eq('school_id', school_id)
        .eq('id', id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('No file exists')
        return data.upload_url
    }

    async deletePersonalAnnouncement(school_id: string, announcement_id: string, path?: string | null) {
        if(path) {
            const {data: udata, error: uerror} = await this.supabase.db.storage
            .from('announcements')
            .remove(path as any)

            if(uerror) {
                throw new InternalServerErrorException(uerror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Announcement_personal')
                .delete()
                .eq('school_id', school_id)
                .eq('id', announcement_id)


                if(error) throw new InternalServerErrorException(error.message)
                return data && udata
            }
        } else {
            const {data, error} = await this.supabase.db
            .from('Announcement_personal')
            .delete()
            .eq('school_id', school_id)
            .eq('id', announcement_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async getAllPersonalAnnouncementsEver (school_id: string) {
        const {data, error} = await this.supabase.db
        .from('Announcement_personal')
        .select('*')
        .eq('school_id', school_id)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAllPersonalForPerson (school_id: string, student_id: string) {
        const auth = await this.swap.swapUUIDFromIdToAuth(school_id, student_id)
        const {data, error} = await this.supabase.db
        .from('Announcement_personal')
        .select('*')
        .eq('school_id', school_id)
        .eq('target_id', auth)

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getFilePathIfExists (school_id: string, announcement_id: string): Promise<string | null> {
        const {data, error} = await this.supabase.db
        .from('Announcement_personal')
        .select('upload_url')
        .eq('id', announcement_id)
        .eq('school_id', school_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.upload_url) throw new NotFoundException('upload_url not found for announcement')
        return data.upload_url ?? null

    }

    async getSignedUrl (school_id: string, assignment_id: string) {
        const path = await this.getFilePathIfExists(school_id, assignment_id)
        const {data, error} = await this.supabase.db.storage
        .from('announcements')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('signed URL not found')
        return data.signedUrl
    }


    //// controller services
    async getParentAuthId (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Students')
        .select('parents_id')
        .eq('school_id', school_id)
        .eq('id', student_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException
        if(!data?.parents_id) throw new NotFoundException('No parent for student')
        const user_id = await this.swap.swapUUIDFromIdToAuth(school_id, data.parents_id)
        return user_id
    }

    
}