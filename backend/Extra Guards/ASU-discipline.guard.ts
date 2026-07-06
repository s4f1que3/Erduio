import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"
import type { Request } from "express"

/// guard for admins, super admins, or the user who issued the discipline record

export const ASU_DisciplineGuard = () => {
    @Injectable()
    class ASU_DisciplineMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'owner' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const discipline_id = req.params.assignment_id as string

            const { data: ndata, error: nerror } = await this.supabase.db
                .from('Student_Discipline')
                .select('disciplined_by')
                .eq('school_id', school_id)
                .eq('id', discipline_id)
                .single()

            if (nerror || !ndata?.disciplined_by)  throw new UnauthorizedException()
            if (data.user.id !== ndata.disciplined_by) throw new ForbiddenException()

            return true
        }
    }

    return mixin(ASU_DisciplineMixin)
}
