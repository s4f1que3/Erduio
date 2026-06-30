import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"

export const TeacherSubjectGuard = () => {
    @Injectable()
    class TeacherSubjectMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & {user: any, role: string}>()
            const token = req.headers.authorization?.split(' ')[1]
            if(!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            const school_id = data.user.app_metadata.school_id
            const subject_id = req.params.subject_id as string

            req.role = data.user.app_metadata.role
            if(req.role === 'owner') return true

            const{data: ndata, error: nerror} = await this.supabase.db
            .from('Class_Subjects')
            .select('teacher_id')
            .eq('school_id', school_id)
            .eq('id', subject_id)
            .single()

            if(nerror || !ndata?.teacher_id)  throw new UnauthorizedException()

            const {data: teacherRow, error: terror} = await this.supabase.db
            .from('Teachers')
            .select('id')
            .eq('school_id', school_id)
            .eq('user_id', data.user.id)
            .maybeSingle()

            if(terror || !teacherRow?.id)  throw new UnauthorizedException()
            if (teacherRow.id !== ndata.teacher_id) throw new ForbiddenException()

            return true
        }
    }

    return mixin(TeacherSubjectMixin)
}