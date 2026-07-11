import { emailingService } from "../../emailing/emailing/emailing.service";
import { Injectable} from "@nestjs/common";

@Injectable()
export class announcementsClassService {

    constructor(
        private readonly email: emailingService
    ){}

    async createClassAnnouncement(school_id: string, title: string, content: string, class_id: string, upload?: Express.Multer.File) {
        if(upload) {
            await this.email.sendClassEmail(content, title, class_id, school_id, upload)
        } else {
            await this.email.sendClassEmail(content, title, class_id, school_id)
        }
    }

}