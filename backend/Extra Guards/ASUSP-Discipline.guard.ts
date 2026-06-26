import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { uuidSwapService } from "pipes/transformuuid.pipe"
import { ForbiddenException } from "@nestjs/common"

/// guard for admins, super admins, the user who issued the discipline record, any student, or the parent of a student

export const ASUSP_DisciplineGuard = () => {
    @Injectable()
    class ASUSP_DisciplineMixin implements CanActivate {
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

            if (req.role === 'admin' || req.role === 'super_admin') return true
            if (req.role === 'student') return true

            const school_id = data.user.app_metadata.school_id
            const student_id = await this.swap.swapUUID(school_id, req.params.id as string)
            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            const { data: ddata, error: derror } = await this.supabase.db
                .from('Student_Discipline')
                .select('disciplined_by')
                .eq('school_id', school_id)
                .eq('student_id', student_id)
                .single()

            if (derror) throw new InternalServerErrorException(derror.message)
            if(!ddata?.disciplined_by) throw new NotFoundException('No user found')
            if(ddata.disciplined_by === data.user.id) return true

            const { data: pdata, error: perror } = await this.supabase.db
                .from('Students')
                .select('parents_id')
                .eq('school_id', school_id)
                .eq('id', student_id)
                .maybeSingle()


            if (perror) throw new InternalServerErrorException(perror.message)
            if(!pdata?.parents_id) throw new NotFoundException('No parent for student')
            if(pdata.parents_id === user_id) return true

             throw new UnauthorizedException()
        }
    }

    return mixin(ASUSP_DisciplineMixin)
}
