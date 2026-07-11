import { Injectable} from "@nestjs/common";
import { emailingService } from "../../emailing/emailing/emailing.service";

@Injectable()
export class announcementsGroupService {

    constructor(
        private readonly email: emailingService
    ){}

    async createGroupAnnouncement(school_id: string, title: string, target: string, content: string, upload?: Express.Multer.File) {
       if(upload) {
            return await this.email.sendToGroup(target, content, title, school_id, upload)
        } else {
            return await this.email.sendToGroup(target, content, title, school_id)
        }
    }

}