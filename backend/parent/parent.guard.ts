import { Injectable } from "@nestjs/common";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { supabaseService } from "supabase_service/supabase.service";
import { ForbiddenException } from "@nestjs/common"
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class ParentGuard implements CanActivate{
    constructor(private readonly supabase: supabaseService){}
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]

        if(!token) throw new UnauthorizedException()
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error || !data.user) throw new UnauthorizedException()
        
        req.user = data.user
        req.role = data.user.app_metadata.role

        req.role = data.user.app_metadata.role
        if(req.role === 'owner' || req.role === 'parent') return true

        return false
    }
}