import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "../pipes/transformuuid.pipe"

export const ParentStudentGuard = () => {
    @Injectable()
    class ParentStudentMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & {user: any, role: string}>()
            const token = req.headers.authorization?.split(' ')[1]
            if(!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            const school_id = data.user.app_metadata.school_id
            const student_id = req.params.student_id as string

            const{data: ndata, error: nerror} = await this.supabase.db
            .from('Students')
            .select('parents_id')
            .eq('school_id', school_id)
            .eq('id', student_id)
            .single()

            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            if(nerror || !ndata?.parents_id)  throw new UnauthorizedException()
            if (user_id !== ndata.parents_id) throw new ForbiddenException()

            return true
        }
    }

    return mixin(ParentStudentMixin)
}