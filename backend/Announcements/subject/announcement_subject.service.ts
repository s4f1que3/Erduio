import { Injectable} from "@nestjs/common";
import { emailingService } from "../../emailing/emailing/emailing.service";

@Injectable()
export class announcementsSubjectService {

    constructor(
        private readonly email: emailingService
    ){}

    async createSubjectAnnouncement(school_id: string, title: string, content: string, subject_id: string, upload?: Express.Multer.File) {
        if(upload) {
            return await this.email.sendSubjectEmail(content, title, subject_id, school_id, upload)
        } else {
            return await this.email.sendSubjectEmail(content, title, subject_id, school_id)
        }
    }
}