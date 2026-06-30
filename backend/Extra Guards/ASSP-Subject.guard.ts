import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { ForbiddenException } from "@nestjs/common"

/// guard for admins, super admins, a student enrolled in the subject, or the parent of that student

export const ASSP_SubjectGuard = () => {
    @Injectable()
    class ASSP_SubjectMixin implements CanActivate {
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
            const subject_id = req.params.subject_id as string
            const student_id = req.params.student_id as string

            const { data: sdata, error: serror } = await this.supabase.db
                .from('Student_Subjects')
                .select('students_id')
                .eq('school_id', school_id)
                .eq('subjects_id', subject_id)
                .single()

            if (!serror && sdata?.students_id && data.user.id === sdata.students_id) return true

            const { data: pdata, error: perror } = await this.supabase.db
                .from('Students')
                .select('parents_id')
                .eq('school_id', school_id)
                .eq('id', student_id)
                .single()

            if (!perror && pdata?.parents_id && data.user.id === pdata.parents_id) return true

             throw new UnauthorizedException()
        }
    }

    return mixin(ASSP_SubjectMixin)
}
