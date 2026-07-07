import { Body, Controller, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { emailingService } from "./emailing.service";
import { AdminLogger } from "../Interceptors/admin logger interceptor/admin.logger.interceptor";
import { AdminLogMessage } from "../Interceptors/admin logger interceptor/message-decorator";
import { AsGuard } from "../Extra Guards/AS.guard";
import { emailDTO } from "./email.dto";

@Controller('email')
@UseGuards(AsGuard)
export class emailController {

    constructor(private readonly email: emailingService){}

    @Post('send')
    @UseInterceptors(AdminLogger)
    @AdminLogMessage("sent an email to the platform owner")
    async sendEmail (@Body() dto: emailDTO, @Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.email.sendEmail(dto.message, dto.subject, school_id)
    }
}
