import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { supabaseService } from "../supabase_service/supabase.service";
import { termsService } from "../terms/terms.service";
import { emailingService } from "../emailing/emailing.service";
import { LoggingService } from "../logging services/logging.service";

@Injectable()
export class uploadNotesService {
    constructor(
        private readonly supabase: supabaseService,
        private readonly email: emailingService,
        private readonly logging: LoggingService
    ){}

    async uploadNotes (school_id: string, teacher_id: string, subject_id: string, title: string, upload?: Express.Multer.File, message?: string,) {
        
        if(message && upload) {

            const path = `${school_id}/notes/${subject_id}/${crypto.randomUUID()}`
            const {data: fdata, error: ferror} = await this.supabase.db.storage
            .from('notes')
            .upload(path, upload.buffer, {contentType: upload.mimetype})

            if(ferror) throw new InternalServerErrorException(ferror.message)
            const{data, error} = await this.supabase.db.from('Subject_Notes')
            .insert({
                teacher_id: teacher_id,
                subject_id: subject_id,
                file_path: path,
                title: title,
                message: message,
                school_id: school_id
            })

            if(error) throw new InternalServerErrorException(error.message)
            await this.email.sendSubjectEmail(`Your teacher just uploaded new notes '${title}'!`, 'New notes uploaded!', subject_id, school_id)
            return data && fdata

        } else if(upload) {

            const path = `${school_id}/notes/${subject_id}/${crypto.randomUUID()}`
            const {data: fdata, error: ferror} = await this.supabase.db.storage
            .from('notes')
            .upload(path, upload.buffer, {contentType: upload.mimetype})
            if(ferror) throw new InternalServerErrorException(ferror.message)

            const{data, error} = await this.supabase.db.from('Subject_Notes')
            .insert({
                teacher_id: teacher_id,
                subject_id: subject_id,
                file_path: path,
                title: title,
                school_id: school_id
            })

            if(error) throw new InternalServerErrorException(error.message)
            await this.email.sendSubjectEmail(`Your teacher just uploaded new notes '${title}'!. This note has an attatchment which you are able to download`, 'New notes uploaded!', subject_id, school_id)
            return data && fdata

        } else if(message) {

            const{data, error} = await this.supabase.db.from('Subject_Notes')
            .insert({
                teacher_id: teacher_id,
                subject_id: subject_id,
                title: title,
                message: message,
                school_id: school_id
            })

            if(error) throw new InternalServerErrorException(error.message)
            await this.email.sendSubjectEmail(`Your teacher just uploaded new notes '${title}'!`, 'New notes uploaded!', subject_id, school_id)
            return data
        }
    }

    async getFilePath(school_id: string, note_id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Notes')
        .select('file_path')
        .eq('school_id', school_id)
        .eq('id', note_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.file_path) throw new NotFoundException('Note file path not found')
        return data.file_path
    }

    async deleteNotes(school_id: string, note_id: string) {
        const path = await this.getFilePath(school_id, note_id)
        const {error} = await this.supabase.db
        .from('Subject_Notes')
        .delete()
        .eq('school_id', school_id)
        .eq('id', note_id)

        if(error) throw new InternalServerErrorException(error.message)
        const {error: ferror} = await this.supabase.db.storage
        .from('notes')
        .remove(path as any)

        if(ferror) throw new InternalServerErrorException(ferror.message)
        const title = await this.logging.getNoteName(school_id, note_id)
        const subject_id = await this.logging.getSubjectIdFromNote(school_id, note_id)
        await this.email.sendSubjectEmail(`Your teacher just deleted the note '${title}'!`, 'Notes deleted!', subject_id, school_id)
    }

    async updateNote(school_id: string, note_id: string, title?: string, message?: string) {
        const updates: Record<string, any> = {}
        if(title) updates.title = title
        if(message) updates.message = message
        const {data, error} = await this.supabase.db
        .from('Subject_Notes')
        .update(updates as any)
        .eq('school_id', school_id)
        .eq('id', note_id)

        if(error) throw new InternalServerErrorException(error.message)
        const subject_id = await this.logging.getSubjectIdFromNote(school_id, note_id)
        await this.email.sendSubjectEmail(`Your teacher just updated the note '${title}'!`, 'Notes updated!', subject_id, school_id)
        return data
    }

    async getAllNotesForSubject(school_id: string, subject_id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Notes')
        .select('*')
        .eq('school_id', school_id)
        .eq('subject_id', subject_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAllNotesForTeacher(school_id: string, teacher_id: string) {
        const {data, error} = await this.supabase.db
        .from('Subject_Notes')
        .select('*')
        .eq('school_id', school_id)
        .eq('teacher_id', teacher_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async viewNote (school_id: string, note_id: string) {
        const path = await this.getFilePath(school_id, note_id)

        if(!path) throw new NotFoundException('File path not found')

        const {data: fdata, error: ferror} = await this.supabase.db.storage
        .from('notes')
        .createSignedUrl(path, 3600)
        if(ferror) throw new InternalServerErrorException(ferror.message)
        return fdata.signedUrl
    }

    async downloadNote (school_id: string, note_id: string) {
        const path = await this.getFilePath(school_id, note_id)

        if(!path) throw new NotFoundException('No file for this note')
        
        const {data: ndata, error: nerror} = await this.supabase.db.storage
        .from('notes')
        .download(path)

        if(nerror) throw new InternalServerErrorException(nerror.message)
        return ndata
    }


}