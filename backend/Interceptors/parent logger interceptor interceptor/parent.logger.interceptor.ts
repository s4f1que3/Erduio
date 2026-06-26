import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { LoggingService } from "logging services/logging.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { Observable } from "rxjs";
import { supabaseService } from "supabase_service/supabase.service";

@Injectable()
export class ParentLogger implements NestInterceptor {
    constructor (
        private readonly logging: LoggingService,
        private readonly supabase: supabaseService,
        private readonly swap: uuidSwapService,
        private reflector: Reflector
    ){}
     async intercept(context: ExecutionContext, next: CallHandler): Promise <Observable <any> > {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const message = this.reflector.get<string>('ParentLogMessage', context.getHandler())
        
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error) throw new InternalServerErrorException(error.message)
        if(!data.user) throw new UnauthorizedException()

        req.user = data.user
        const school_id = data.user.app_metadata.school_id
        const parent_id = req.params.id ?? req.params.parent_id

        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, parent_id)

        await this.logging.insertPersonalLog(school_id, auth_id, message)

        return next.handle()
    }
}