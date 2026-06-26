import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { supabaseService } from "supabase_service/supabase.service"

/// guard for admins, super admins, or teachers

@Injectable()
export class ASTGuard implements CanActivate {
    constructor(private readonly supabase: supabaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if (!token)  throw new UnauthorizedException()

        const { data, error } = await this.supabase.db.auth.getUser(token)
        if (error || !data.user)  throw new UnauthorizedException()

        req.user = data.user
        req.role = data.user.app_metadata.role

        if (req.role === 'admin' || req.role === 'super_admin' || req.role === 'teacher') return true

        throw new ForbiddenException('You are not authorized to access this')
    }
}