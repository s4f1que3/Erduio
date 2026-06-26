import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"
import { ForbiddenException } from "@nestjs/common"

/// guard for admins, super admins, the class teacher, any student, or the parent of a student

export const ASTSP_ClassGuard = () => {
    @Injectable()
    class ASTSP_ClassMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'super_admin') return true
            if (req.role === 'student') return true

            const school_id = data.user.app_metadata.school_id
            const class_id = req.params.class_id as string
            const student_id = req.params.student_id as string

            const { data: cdata, error: cerror } = await this.supabase.db
                .from('Classes')
                .select('class_teacher_id')
                .eq('school_id', school_id)
                .eq('id', class_id)
                .single()

                const teacher_id = await this.swap.swapUUID(school_id, req.user.id)

            if (!cerror && cdata?.class_teacher_id && teacher_id === cdata.class_teacher_id) return true

            const { data: pdata, error: perror } = await this.supabase.db
                .from('Students')
                .select('parents_id')
                .eq('school_id', school_id)
                .eq('id', student_id)
                .single()

                const parent_id = await this.swap.swapUUID(school_id, req.user.id)

            if (!perror && pdata?.parents_id && parent_id === pdata.parents_id) return true

             throw new UnauthorizedException()
        }
    }

    return mixin(ASTSP_ClassMixin)
}
