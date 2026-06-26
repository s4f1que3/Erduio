import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { LoggingService } from "logging services/logging.service";
import { Observable } from "rxjs";
import { supabaseService } from "supabase_service/supabase.service";

@Injectable()
export class PersonalLogger implements NestInterceptor {
    constructor (
        private readonly logging: LoggingService,
        private readonly supabase: supabaseService,
        private reflector: Reflector
    ){}
     async intercept(context: ExecutionContext, next: CallHandler): Promise <Observable <any> > {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const message = this.reflector.get<string>('PersonalLogMessage', context.getHandler())
        
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error) throw new InternalServerErrorException(error.message)
        if(!data.user) throw new UnauthorizedException()

        req.user = data.user
        const school_id = data.user.app_metadata.school_id

        await this.logging.insertPersonalLog(school_id, data.user.id, message)

        return next.handle()
    }
}