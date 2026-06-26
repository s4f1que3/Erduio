import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"

/// guard for admins, super admins, the teacher assigned to the subject, or a student enrolled in the subject

export const ASTS_SubjectGuard = () => {
    @Injectable()
    class ASTS_SubjectMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error)  throw new UnauthorizedException()
            if(!data.user) throw new InternalServerErrorException('No data returned for user')

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const subject_id = req.params?.subject_id as string
            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            const { data: tdata, error: terror } = await this.supabase.db
                .from('Class_Subjects')
                .select('teacher_id')
                .eq('school_id', school_id)
                .eq('id', subject_id)
                .maybeSingle()

                if (terror) throw new InternalServerErrorException(terror.message)
                if (tdata?.teacher_id === user_id) return true


            const {data: sdata, error: serror} = await this.supabase.db
            .from('Student_Subjects')
            .select('students_id')
            .eq('school_id', school_id)
            .eq('subjects_id', subject_id)
            .eq('students_id', user_id)
            .maybeSingle()

            if(serror) throw new InternalServerErrorException(serror.message)
            if(sdata?.students_id) return true


            throw new ForbiddenException('You are not authorized to access this')
        }
    }

    return mixin(ASTS_SubjectMixin)
}
