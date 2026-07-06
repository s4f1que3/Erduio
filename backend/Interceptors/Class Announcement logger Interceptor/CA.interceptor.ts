import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { announcementsClassService } from "../../Announcements/Class/announcement_class.service";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { Observable } from "rxjs";
import { supabaseService } from "../../supabase_service/supabase.service";

@Injectable()
export class CALogger implements NestInterceptor {
    constructor (
        private readonly supabase: supabaseService,
        private readonly announ: announcementsClassService,
        private reflector: Reflector
    ){}
     async intercept(context: ExecutionContext, next: CallHandler): Promise <Observable <any> > {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const message = this.reflector.get<string>('CAMessage', context.getHandler())
        const title = this.reflector.get<string>('CATitle', context.getHandler())
        const class_id = req.params.class_id
        
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error) throw new InternalServerErrorException(error.message)
        if(!data.user) throw new UnauthorizedException()

        req.user = data.user
        const school_id = resolveSchoolId(req)


        await this.announ.createClassAnnouncement(school_id, title, message, class_id)

        return next.handle()
    }
}