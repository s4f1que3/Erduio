import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "../pipes/transformuuid.pipe"


@Injectable()
export class StudentSubjectGuard implements CanActivate {
    constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request & {user: any, role: string}>()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const { data, error } = await this.supabase.db.auth.getUser(token)
        if (error || !data.user)  throw new UnauthorizedException()

        req.user = data.user
        const school_id = data.user.app_metadata.school_id
        const subject_id = req.params.subject_id as string
        const user_id = await this.swap.swapUUID(school_id, req.user.id)
        
        req.role = data.user.app_metadata.role
        if(req.role === 'owner') return true


        const{data: ndata, error: nerror} = await this.supabase.db
        .from('Student_Subjects')
        .select('students_id')
        .eq('school_id', school_id)
        .eq('subjects_id', subject_id)
        .eq('students_id', user_id)
        .single()

        if(nerror || !ndata?.students_id) throw new ForbiddenException()
        return true
    }
}

