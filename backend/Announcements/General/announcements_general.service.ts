import { Injectable} from "@nestjs/common";
import { emailingService } from "../../emailing/emailing/emailing.service";

@Injectable()
export class announcementsGeneralService {

    constructor(
        private readonly email: emailingService, 
    ){}

    async createGeneralAnnouncement(school_id: string, title: string, content: string, upload?: Express.Multer.File) {
        if(upload) {
            await this.email.sendGeneralEmail(content, title, school_id, upload)
        } else {
            await this.email.sendGeneralEmail(content, title, school_id)
        }
    }

}