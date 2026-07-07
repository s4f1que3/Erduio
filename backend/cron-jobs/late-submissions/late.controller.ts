import { Public } from "../../Extra Guards/public/public.metadata";
import { lateService } from "./late.service";
import { Controller, Get, Req } from "@nestjs/common";
import type Request from "express";
import { resolveSchoolId } from "../../overrides/school_id.override";

@Controller('email/late')
@Public()
export class lateController {
    constructor(private readonly late: lateService){}

    @Get('send')
    async sendLateEmail (@Req() req: Request) {
        return await this.late.SendEmailsForUnsubmittedAssignments()
    }
}