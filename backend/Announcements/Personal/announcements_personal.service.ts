import { Injectable} from "@nestjs/common";
import { emailingService } from "../../emailing/emailing/emailing.service";
import { uuidSwapService } from "../../pipes/transformuuid.pipe";

@Injectable()
export class announcementsPersonalService {

    constructor(
        private readonly email: emailingService,
        private readonly swap: uuidSwapService
    ){}

    async createPersonalAnnouncement(school_id: string, title: string, user_id: string, content: string, upload?: Express.Multer.File) {
        const id = await this.swap.swapUUID(school_id, user_id)
        if(upload) {
            await this.email.sendEmailToUser(content, title, school_id, {user_id: id}, upload)
        } else {
            await this.email.sendEmailToUser(content, title, school_id, {user_id: id})
        }
    }
    
}