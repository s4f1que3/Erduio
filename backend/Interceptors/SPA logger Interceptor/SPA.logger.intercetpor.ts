import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { announcementsPersonalService } from "Announcements/Personal/announcements_personal.service";
import { resolveSchoolId } from "overrides/school_id.override";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { Observable } from "rxjs";
import { supabaseService } from "supabase_service/supabase.service";

@Injectable()
export class StudentPersonalAnnouncementLogger implements NestInterceptor {
    constructor (
        private readonly supabase: supabaseService,
        private readonly personal: announcementsPersonalService,
        private readonly swap: uuidSwapService,
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
        const school_id = resolveSchoolId(req)
        const message = this.reflector.get<string>('SPAMessage', context.getHandler())
        const title = this.reflector.get<string>('SPATitle', context.getHandler())
        const student_id = await this.swap.swapUUIDFromIdToAuth(school_id, req.params.student_id)

        await this.personal.createPersonalAnnouncement(school_id, title, student_id, message)

        return next.handle()
    }
}