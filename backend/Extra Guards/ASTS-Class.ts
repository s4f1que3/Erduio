import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { ForbiddenException } from "@nestjs/common"

/// guard for admins, super admins, the class teacher, or a student in the class

export const ASTS_ClassGuard = () => {
    @Injectable()
    class ASTS_ClassMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const class_id = req.params.class_id as string

            const { data: cdata, error: cerror } = await this.supabase.db
                .from('Classes')
                .select('class_teacher_id')
                .eq('school_id', school_id)
                .eq('id', class_id)
                .single()

            if (cerror || !cdata?.class_teacher_id)  throw new UnauthorizedException()

            if (req.user.id === cdata.class_teacher_id) return true

            const { data: ndata, error: nerror } = await this.supabase.db
                .from('Students')
                .select('class_id')
                .eq('school_id', school_id)
                .eq('user_id', data.user.id)
                .maybeSingle()

            if (nerror) throw new InternalServerErrorException(nerror.message)
            if(!ndata?.class_id)  throw new NotFoundException('You do not belong to any classes')
            if(ndata?.class_id !== class_id) throw new ForbiddenException('You do not belong to this class')

            return true
        }
    }

    return mixin(ASTS_ClassMixin)
}
