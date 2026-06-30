import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { logGetterService } from "logGetters/logGetters.service";
import { LoggingService } from "logging services/logging.service";
import { resolveSchoolId } from "overrides/school_id.override";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { Observable } from "rxjs";
import { supabaseService } from "supabase_service/supabase.service";
import { termsService } from "terms/terms.service";

@Injectable()
export class SALLogger implements NestInterceptor {
    constructor (
        private readonly getter: logGetterService,
        private readonly logging: LoggingService,
        private readonly supabase: supabaseService,
        private readonly swap: uuidSwapService,
        private readonly term: termsService,
        private reflector: Reflector
    ){}
     async intercept(context: ExecutionContext, next: CallHandler): Promise <Observable <any> > {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const message = this.reflector.get<string>('SALMessage', context.getHandler())
        
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error) throw new InternalServerErrorException(error.message)
        if(!data.user) throw new UnauthorizedException()

        req.user = data.user
        const school_id = resolveSchoolId(req)

        await this.logging.insertSimpleAdminLog(school_id, message)

        return next.handle()
    }
}