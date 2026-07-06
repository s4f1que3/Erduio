import { Injectable } from "@nestjs/common";
import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { supabaseService } from "../supabase_service/supabase.service";
import { Reflector } from "@nestjs/core";

//// guard for admins AND super admins

@Injectable()
export class GlobalGuard implements CanActivate{
    constructor(private readonly supabase: supabaseService, private readonly reflector: Reflector){}
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]

        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass()
        ])

        if(isPublic) return true

        if(!token) throw new UnauthorizedException()
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error || !data.user) throw new UnauthorizedException()
        
        req.user = data.user
        req.role = data.user.app_metadata.role
        req.school_id = req.user.app_metadata.school_id ?? req.params.school_id

        return true
    }
}