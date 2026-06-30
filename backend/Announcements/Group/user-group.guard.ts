import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, mixin } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"
import type { Request } from "express"
import { ForbiddenException } from "@nestjs/common"

export const userGroupGuard = () => {
    @Injectable()
    class userGroupMixin implements CanActivate {
        constructor(public readonly supabase: supabaseService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest<Request & {user: any, role: string}>()
            const token = req.headers.authorization?.split(' ')[1]
            if(!token) throw new UnauthorizedException()

            const { data, error } = await this.supabase.db.auth.getUser(token)
            if (error || !data.user)  throw new UnauthorizedException()

            req.user = data.user
            const group = req.params.group
            const user_role = data.user.app_metadata.role

            if(user_role !== group)  throw new UnauthorizedException()
            return true
        }
    }

    return mixin(userGroupMixin)
}