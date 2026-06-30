import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"
import { ForbiddenException } from "@nestjs/common"

/// guard for admins, super admins, teachers, students, or the parent of a student

export const ASTSP_ExamGuard = () => {
    @Injectable()
    class ASTSP_ExamMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error) throw new InternalServerErrorException(error.message)
            if (!data.user) throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role
            const school_id = data.user.app_metadata.school_id
            const student_id = req.params.student_id as string
            const exam_id = req.params.exam_id as string
            const user_id = await this.swap.swapUUID(school_id, data.user.id)


            if (req.role === 'admin' || req.role === 'owner' || req.role === 'super_admin') return true
            if (req.role === 'student') return true

            const { data: cdata, error: cerror } = await this.supabase.db
                .from('Exams')
                .select('subject_id')
                .eq('school_id', school_id)
                .eq('id', exam_id)
                .maybeSingle()

                if(cerror) throw new InternalServerErrorException(cerror.message)
                if(!cdata?.subject_id) throw new NotFoundException('No subject found')

            const {data: sdata, error: serror} = await this.supabase.db
            .from('Class_Subjects')
            .select('teacher_id')
            .eq('school_id', school_id)
            .eq('id', cdata?.subject_id)
            .maybeSingle()

            if(serror) throw new InternalServerErrorException(serror.message)
            if(!sdata?.teacher_id) throw new NotFoundException('No teacher found')
            
            if(sdata.teacher_id === user_id) return true

            const { data: pdata, error: perror } = await this.supabase.db
                .from('Students')
                .select('parents_id')
                .eq('school_id', school_id)
                .eq('id', student_id)
                .single()


            if (perror) throw new InternalServerErrorException(perror.message)
            if(!pdata?.parents_id) throw new NotFoundException('No parent for student')
            if(pdata.parents_id === user_id) return true

             throw new UnauthorizedException()
        }
    }

    return mixin(ASTSP_ExamMixin)
}