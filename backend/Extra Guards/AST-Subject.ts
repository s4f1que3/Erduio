import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"

/// guard for admins, super admins, or the teacher assigned to the subject

export const AST_SubjectGuard = () => {
    @Injectable()
    class AST_SubjecMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error) throw new InternalServerErrorException (error.message)
            if (!data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'owner' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const subject_id = req.params.subject_id as string

            const { data: ndata, error: nerror } = await this.supabase.db
                .from('Class_Subjects')
                .select('teacher_id') 
                .eq('school_id', school_id)
                .eq('id', subject_id)
                .single()

            if (nerror) throw new InternalServerErrorException(nerror.message)
            if(!ndata?.teacher_id) throw new NotFoundException('No teacher exists for this class')

            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            if (user_id !== ndata.teacher_id) throw new ForbiddenException('You are not authorized to access this')

            return true
        }
    }

    return mixin(AST_SubjecMixin)
}
