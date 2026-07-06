import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { supabaseService } from "../supabase_service/supabase.service";
import { ForbiddenException } from "@nestjs/common"

@Injectable()
export class TeachersGuard implements CanActivate {
    constructor(private readonly supabase: supabaseService){}
     async canActivate(context: ExecutionContext

    ):Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]

        if(!token) throw new UnauthorizedException()
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(!data.user || error)  throw new UnauthorizedException()
        
        req.user = data.user
        req.user.app_metadata.role = data.user.app_metadata.role

        if(req.user.app_metadata.role === 'teacher' || req.role === 'owner') return true

        return false

    }
}