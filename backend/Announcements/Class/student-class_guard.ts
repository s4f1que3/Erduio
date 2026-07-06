import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "../../supabase_service/supabase.service"
import type { Request } from "express"
import { ForbiddenException } from "@nestjs/common"

export const StudentClassGuard = () => {
    @Injectable()
    class StudentClassMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & {user: any, role: string}>()
            const token = req.headers.authorization?.split(' ')[1]
            if(!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()
            

            req.user = data.user
            const school_id = data.user.app_metadata.school_id
            const class_id = req.params.class_id as string

            req.role = data.user.app_metadata.role
            if(req.role === 'owner') return true

            const{data: ndata, error: nerror} = await this.supabase.db
            .from('Students')
            .select('class_id')
            .eq('school_id', school_id)
            .eq('user_id', data.user.id)
            .single()

            if(nerror) throw new InternalServerErrorException(nerror.message)
            if(!ndata?.class_id)  throw new NotFoundException('You do not belong to any classes')
            if(ndata.class_id !== class_id) throw new NotFoundException('You are not a student in this class')

            return true
        }
    }

    return mixin(StudentClassMixin)
}