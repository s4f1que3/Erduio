import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, NotFoundException, UnauthorizedException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { announcementsPersonalService } from "../../Announcements/Personal/announcements_personal.service";
import { resolveSchoolId } from "../../overrides/school_id.override";
import { uuidSwapService } from "../../pipes/transformuuid.pipe";
import { Observable } from "rxjs";
import { supabaseService } from "../../supabase_service/supabase.service";

@Injectable()
export class ParentAnnouncementLogger implements NestInterceptor {
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
        const message = this.reflector.get<string>('ParentAnnouncementMessage', context.getHandler())
        const title = this.reflector.get<string>('ParentAnnouncementTitle', context.getHandler())
        const student_id = req.params.student_id

        const {data: pdata, error: perror} = await this.supabase.db
        .from('Students')
        .select('parents_id')
        .eq('school_id', school_id)
        .eq('id', student_id)
        .maybeSingle()

        if(perror) throw new InternalServerErrorException(perror.message)
        if(!pdata?.parents_id) throw new NotFoundException('No parent for student')
        const parent_auth = await this.swap.swapUUIDFromIdToAuth(school_id, pdata.parents_id)

        await this.personal.createPersonalAnnouncement(school_id, title, parent_auth, message)

        return next.handle()
    }
}