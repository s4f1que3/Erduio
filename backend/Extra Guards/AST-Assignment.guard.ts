import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException, InternalServerErrorException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"

/// guard for admins, super admins, or the teacher who created the assignment

export const AST_AssignmentGuard = () => {
    @Injectable()
    class AST_AssignmenMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user) throw new InternalServerErrorException(error?.message)

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'owner' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const assignment_id = req.params.assignment_id as string
            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            const { data: ndata, error: nerror } = await this.supabase.db
                .from('Assignments')
                .select('teacher_id')
                .eq('school_id', school_id)
                .eq('id', assignment_id)
                .single()

            if (nerror || !ndata?.teacher_id) throw new InternalServerErrorException(nerror?.message) 
            if (user_id !== ndata.teacher_id) throw new InternalServerErrorException('You are not authorized to access this.')

            return true
        }
    }

    return mixin(AST_AssignmenMixin)
}
