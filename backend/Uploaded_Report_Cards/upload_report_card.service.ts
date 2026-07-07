import { supabaseService } from "../supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { emailingService } from "emailing/emailing.service";
import { LoggingService } from "logging services/logging.service";

@Injectable()
export class uploadReportCardService {

    constructor(
        private readonly supabase: supabaseService,
        private readonly email: emailingService,
        private readonly logging: LoggingService
    ){}

    async uploadReportCard (school_id: string, student_id: string, class_id: string, report_card: Express.Multer.File, title: string) {
        const path = `${school_id}/report-card/${student_id}/${class_id}`
        const {data: fdata, error: ferror} = await this.supabase.db.storage
        .from('report_cards')
        .upload(path, report_card.buffer, {contentType: report_card.mimetype})

        if(ferror) throw new InternalServerErrorException(ferror.message)
        const {data, error} = await this.supabase.db
        .from('Report_Cards')
        .insert({
            school_id: school_id,
            student_id: student_id,
            class_id: class_id,
            file_path: path,
            title: title
        })

        if(error) throw new InternalServerErrorException(error.message)
        await this.email.sendToStudentAndParent(`Your report card  '${title}' was just uploaded on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Click on the report cards tab on the platform to access it.`, `${title} report card uploaded!`, school_id, student_id)
        return data && fdata
        
    }

    async getAllStudentReportCards (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Report_Cards')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getStudentReportCardForClass(school_id: string, student_id: string, class_id: string) {
        const {data, error} = await this.supabase.db
        .from('Report_Cards')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)
        .eq('class_id', class_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async deleteReportCard(school_id: string, report_id: string) {
        const path = await this.getFilePath(school_id, report_id)
        const {error} = await this.supabase.db
        .from('Report_Cards')
        .select('term_id')
        .eq('school_id', school_id)
        .eq('id', report_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)

        const {error: ferror} = await this.supabase.db.storage
        .from('report_cards')
        .remove(path as any)
        if(ferror) throw new InternalServerErrorException(ferror.message)

        const {error: nerror} = await this.supabase.db
        .from('Report_Cards')
        .delete()
        .eq('school_id', school_id)
        .eq('id', report_id)

        if(nerror) throw new InternalServerErrorException(nerror.message)
        const student_id = await this.logging.getStudentIdFromReport(school_id, report_id)
        await this.email.sendToStudentAndParent(`One of your report cards was just deleted by admin on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}. Contact them for and inquiries.`, `Report card deleted!`, school_id, student_id)

    }

    async getFilePath (school_id: string, report_id: string){
        const {data, error} = await this.supabase.db
        .from('Report_Cards')
        .select('file_path')
        .eq('school_id', school_id)
        .eq('id', report_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data.file_path) throw new NotFoundException('Report card not found')
        return data.file_path

    }

    async getSignedUrl (school_id: string, report_id: string) {
        const path = await this.getFilePath(school_id, report_id)
        const {data, error} = await this.supabase.db.storage
        .from('report_cards')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('Failed to generate signed URL')
        return data.signedUrl
    }

    async downloadReportCard (school_id: string, report_id: string) {
        const path = await this.getFilePath(school_id, report_id)
        
        const {data: ndata, error: nerror} = await this.supabase.db.storage
        .from('report_cards')
        .download(path)

        if(nerror) throw new InternalServerErrorException(nerror.message)
        return ndata
    }
}