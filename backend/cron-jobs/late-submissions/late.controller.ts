import { Public } from "../../Extra Guards/public/public.metadata";
import { lateService } from "./late.service";
import { Controller, Get, Req } from "../../node_modules/@nestjs/common";
import { Request } from "../../node_modules/@nestjs/common";
import { resolveSchoolId } from "../../overrides/school_id.override";

@Controller('email/late')
@Public()
export class lateController {
    constructor(private readonly late: lateService){}

    @Get('send')
    async sendLateEmail (@Req() req: Request) {
        const school_id = resolveSchoolId(req)
        return await this.late.SendEmailsForUnsubmittedAssignments(school_id)
    }
}