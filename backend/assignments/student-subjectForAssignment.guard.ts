import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException, InternalServerErrorException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"


@Injectable()
export class StudentSubjectAssignmentGuard implements CanActivate {
    constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request & {user: any}>()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const { data, error } = await this.supabase.db.auth.getUser(token)
        if (error || !data.user)  throw new UnauthorizedException()

        req.user = data.user
        const school_id = data.user.app_metadata.school_id
        const assignment_id = req.params.assignment_id as string
        const user_id = await this.swap.swapUUID(school_id, req.user.id)

        const {data: adata, error: aerror} = await this.supabase.db
        .from('Assignments')
        .select('subject_id')
        .eq('school_id', school_id)
        .eq('id', assignment_id)
        .single()

        if(aerror) throw new InternalServerErrorException(aerror.message)
        
        if(adata.subject_id) {
            const{data: ndata, error: nerror} = await this.supabase.db
            .from('Student_Subjects')
            .select('students_id')
            .eq('school_id', school_id)
            .eq('subjects_id', adata.subject_id)
            .eq('students_id', user_id)
            .single()

            if(nerror || !ndata?.students_id) throw new ForbiddenException()
        }

        return true
    }
}

