import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, NotFoundException, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { announcementsPersonalService } from "Announcements/Personal/announcements_personal.service";
import { LoggingService } from "logging services/logging.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { Observable } from "rxjs";
import { supabaseService } from "supabase_service/supabase.service";

@Injectable()
export class OnwerLogger implements NestInterceptor {
    constructor (
        private readonly supabase: supabaseService,
        private owner: LoggingService,
        private reflector: Reflector
    ){}
     async intercept(context: ExecutionContext, next: CallHandler): Promise <Observable <any> > {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()
        
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error) throw new InternalServerErrorException(error.message)
        if(!data.user) throw new UnauthorizedException()

        req.user = data.user
        const message = this.reflector.get<string>('OwnerMessage', context.getHandler())

        await this.owner.insertOwnerLog(message)

        return next.handle()
    }
}