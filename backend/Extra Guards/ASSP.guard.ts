import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "../pipes/transformuuid.pipe"

/// guard for admins, super admins, any student, or the parent of a student

export const ASSPGuard = () => {
    @Injectable()
    class ASSPMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error) throw new ForbiddenException(error.message)
            if(!data.user) throw new ForbiddenException('No data on the logged in user')

            req.user = data.user
            req.role = data.user.app_metadata.role
            const student_id = req.params.student_id as string

            if (req.role === 'admin' || req.role === 'owner' || req.role === 'super_admin') return true
            if (req.role === 'student') return true

            const school_id = data.user.app_metadata.school_id

            const { data: pdata, error: perror } = await this.supabase.db
                .from('Students')
                .select('parents_id')
                .eq('school_id', school_id)
                .eq('id', student_id)
                .maybeSingle()

                const user_id = await this.swap.swapUUID(school_id, data.user.id)

            if (perror) throw new ForbiddenException(perror.message)
            if(!pdata?.parents_id) throw new ForbiddenException('No parent for student') 
            if(user_id !== pdata.parents_id) throw new ForbiddenException('Your id doesnt match the parent for student')

            return true
        }
    }

    return mixin(ASSPMixin)
}
