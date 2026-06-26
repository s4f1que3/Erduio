import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { announcementsSubjectService } from "Announcements/subject/announcement_subject.service";
import { Observable } from "rxjs";
import { supabaseService } from "supabase_service/supabase.service";

@Injectable()
export class SALogger implements NestInterceptor {
    constructor (
        private readonly supabase: supabaseService,
        private readonly subject: announcementsSubjectService,
        private reflector: Reflector
    ){}
     async intercept(context: ExecutionContext, next: CallHandler): Promise <Observable <any> > {
        const req = context.switchToHttp().getRequest()
        const token = req.headers.authorization?.split(' ')[1]
        if(!token) throw new UnauthorizedException()

        const message = this.reflector.get<string>('SAMessage', context.getHandler())
        const title = this.reflector.get<string>('SATitle', context.getHandler())
        const subject_id = req.params.subject_id
        
        const {data, error} = await this.supabase.db.auth.getUser(token)
        if(error) throw new InternalServerErrorException(error.message)
        if(!data.user) throw new UnauthorizedException()

        req.user = data.user
        const school_id = data.user.app_metadata.school_id

        await this.subject.createNewShortSubjectAnnouncement(school_id, subject_id, title, message)

        return next.handle()
    }
}