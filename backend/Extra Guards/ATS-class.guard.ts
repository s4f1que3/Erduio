import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { ForbiddenException } from "@nestjs/common"

/// guard to ensure it's either the teacher for the class or a student in the class

export const ATSClassGuard = () => {
    @Injectable()
    class TeacherClass_StudentClassMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & {user: any, role: any}>()
            const token = req.headers.authorization?.split(' ')[1]
            if(!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role
            const school_id = data.user.app_metadata.school_id
            const class_id = req.params.class_id as string

            if (req.role === 'admin' || req.role === 'super_admin') return true

            const { data: cdata, error: cerror } = await this.supabase.db
                .from('Classes')
                .select('class_teacher_id')
                .eq('school_id', school_id)
                .eq('id', class_id)
                .single()

            if (cerror) throw new InternalServerErrorException(cerror.message)
            if(!cdata?.class_teacher_id)  throw new NotFoundException('No class teacher found')
            if (req.user.id !== cdata.class_teacher_id) throw new ForbiddenException('You are not allowed to access this')

            const { data: ndata, error: nerror } = await this.supabase.db
                .from('Students')
                .select('class_id')
                .eq('school_id', school_id)
                .eq('user_id', data.user.id)
                .maybeSingle()

            if (nerror) throw new InternalServerErrorException(nerror.message)
            if(!ndata?.class_id)  throw new NotFoundException('You do not belong to any classes')
            if(ndata.class_id !== class_id) throw new ForbiddenException('You are not authorized to access this')

            return true
        }
    }

    return mixin(TeacherClass_StudentClassMixin)
}
