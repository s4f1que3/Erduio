import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"

/// guard for admins, super admins, or the class teacher

export const AST_CLASSGuard = () => {
    @Injectable()
    class AST_CLASSMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any, params: Record<string, string>, body: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const class_id = req.params?.class_id ?? req.params?.class_id ?? req.params?.id

            const { data: ndata, error: nerror } = await this.supabase.db
                .from('Classes')
                .select('class_teacher_id')
                .eq('school_id', school_id)
                .eq('id', class_id)
                .single()

            if (nerror || !ndata?.class_teacher_id)  throw new UnauthorizedException()

            const { data: teacherRow, error: terror } = await this.supabase.db
                .from('Teachers')
                .select('id')
                .eq('school_id', school_id)
                .eq('user_id', data.user.id)
                .maybeSingle()

            if (terror || !teacherRow?.id)  throw new UnauthorizedException()
            if (teacherRow.id !== ndata.class_teacher_id) throw new ForbiddenException()

            return true
        }
    }

    return mixin(AST_CLASSMixin)
}
