import { supabaseService } from "../../supabase_service/supabase.service";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { emailingService } from "../../emailing/emailing.service";
import { supabaseAdminService } from "../../supabaseAdminService/supabase_admin.service";

@Injectable()
export class lateService {

    constructor(
        private readonly supaabse: supabaseAdminService,
        private readonly email: emailingService
    ){}

    async SendEmailsForUnsubmittedAssignments () {
        const results: string[] = []

        const {data: schools, error: scerror} = await this.supaabse.db
        .from('Schools')
        .select('id')
        if(scerror) throw new InternalServerErrorException(scerror.message)
        
        
        const school_ids = (schools ?? []).map(s => s.id).filter(Boolean) as string []

        for(const school_id of school_ids) {
            const now = Date.now()
            const one_day_ms = 24 * 60 * 60 * 1000;
            const one_min_ms = 60 * 1000;

            // Create a tight 1-minute window centered exactly 24 hours from now
            const startWindow = new Date(now + one_day_ms - one_min_ms).toISOString();
            const endWindow = new Date(now + one_day_ms + one_min_ms).toISOString();

            const {data, error} = await this.supaabse.db
            .from('Assignments')
            .select('id, subject_id, name')
            .eq('school_id', school_id)
            .gte('due_date', startWindow)
            .lte('due_date', endWindow)

            if(error) throw new InternalServerErrorException(error.message)
            const assignmentIds = (data ?? []).map(a => a.id).filter(Boolean) as string[]
            const subjectIds = (data ?? []).map(s => s.subject_id).filter(Boolean) as string[]

            
            const {data: sdata, error: serror} = await this.supaabse.db
            .from('Student_Subjects')
            .select('students_id')
            .eq('school_id', school_id)
            .in('subjects_id', subjectIds)

            if(serror) throw new InternalServerErrorException(serror.message)
            const studentIds = (sdata ?? []).map(s => s.students_id).filter(Boolean) as string[]

            
            const {data: ndata, error: nerror} = await this.supaabse.db
            .from('Submissions')
            .select('students_id')
            .eq('school_id', school_id)
            .in('assignment_id', assignmentIds)

            if(nerror) throw new InternalServerErrorException(nerror)
            const submissions = (ndata ?? []).map(s => s.students_id).filter(Boolean) as string[]
            const notSubmitted = studentIds.filter(id => !submissions.includes(id))

            
            const {data: edata, error: eerror} = await this.supaabse.db
            .from('Students')
            .select('email')
            .eq('school_id', school_id)
            .in('id', notSubmitted)

            if(eerror) throw new InternalServerErrorException(eerror.message)
            const notSubmittedSEmails = (edata ?? []).map(e => e.email).filter(Boolean) as string[]

            
            const {data: pdata, error: perror} = await this.supaabse.db
            .from('Students')
            .select('parents_id')
            .eq('school_id', school_id)
            .in('id', notSubmitted)

            if(perror) throw new InternalServerErrorException(perror.message)
            const parentIds = (pdata ?? []).map(p => p.parents_id).filter(Boolean) as string[]
            
            
            const {data: xdata, error: xerror} = await this.supaabse.db
            .from('Parents')
            .select('email')
            .eq('school_id', school_id)
            .in('id', parentIds)

            if(xerror) throw new InternalServerErrorException(xerror.message)
            const parentEmails = (xdata ?? []).map(x => x.email).filter(Boolean) as string []
            const notSubmittedEmails = Array.from(new Set([...parentEmails, ...notSubmittedSEmails]))

            if(notSubmittedEmails.length !== 0) {
            results.push(await this.email.sendToStudentAndParentProvided('You have one OR more assignments due in 24hrs that you have not uploaded a submission for as yet. Please visit the platform and check this.', 'Unsubmitted assignment!', school_id, notSubmittedEmails))}
        }

        return results
        
    }
}