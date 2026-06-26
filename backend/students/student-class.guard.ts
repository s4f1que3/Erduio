import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, ForbiddenException, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"

export const StudentClassGuard = () => {
    @Injectable()
    class StudentClassMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & {user: any}>()
            const token = req.headers.authorization?.split(' ')[1]
            if(!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            const school_id = data.user.app_metadata.school_id
            const class_id = req.params.id as string
            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            const{data: ndata, error: nerror} = await this.supabase.db
            .from('Students')
            .select('class_id')
            .eq('school_id', school_id)
            .eq('user_id', data.user.id)
            .single()

            if(nerror) throw new InternalServerErrorException(nerror.message)
            if(!ndata?.class_id)  throw new NotFoundException('You do not belong to any classes.')
            if(ndata.class_id !== class_id) throw new ForbiddenException('You are not authorized to access this')
            return true
        }
    }

    return mixin(StudentClassMixin)
}