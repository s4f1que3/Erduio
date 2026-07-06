import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin, InternalServerErrorException } from "@nestjs/common"
import { supabaseService } from "../supabase_service/supabase.service"
import type { Request } from "express"
import { ForbiddenException } from "@nestjs/common"
import { uuidSwapService } from "../pipes/transformuuid.pipe"

/// guard for admins, super admins, any student, or the parent of a student

export const ASSP_ReportGuard = () => {
    @Injectable()
    class ASSP_ReportMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService, public readonly swap: uuidSwapService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & { user: any; role: any }>()
            const token = req.headers.authorization?.split(' ')[1]
            if (!token)  throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            req.role = data.user.app_metadata.role

            if (req.role === 'admin' || req.role === 'owner' || req.role === 'super_admin') return true

            const school_id = data.user.app_metadata.school_id
            const report_id = req.params.report_id as string
            const user_id = await this.swap.swapUUID(school_id, data.user.id)

            const {data: sdata, error: serror} = await this.supabase.db
            .from('Report_Cards')
            .select('student_id')
            .eq('school_id', school_id)
            .eq('id', report_id)
            .single()

            if(!serror && sdata.student_id && sdata.student_id === user_id) return true

            if(sdata?.student_id) {
                const {data, error} = await this.supabase.db
                .from('Students')
                .select('parents_id')
                .eq('school_id', school_id)
                .eq('id', sdata?.student_id)
                .maybeSingle()

                if(error) throw new InternalServerErrorException(error.message)
                if(!data?.parents_id) throw new UnauthorizedException('No parent for this student')
                if(data.parents_id === user_id) return true
            }

             throw new UnauthorizedException()
        }
    }

    return mixin(ASSP_ReportMixin)
}