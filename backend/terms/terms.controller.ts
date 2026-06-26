import { termsService } from "./terms.service";
import { termDto, UpdatetermDto } from "./terms.dto";
import { Controller, Req, Patch, Post, Delete, Body, UseGuards, Param, Get, UseInterceptors } from "@nestjs/common";
import { Request } from "express";
import { GlobalGuard } from "Extra Guards/global.guard";
import { ASTGuard } from "Extra Guards/AST.guard";
import { AdminLogger } from "Interceptors/admin logger interceptor/admin.logger.interceptor";
import { PersonalLogger } from "Interceptors/personal logger interceptor interceptor/personal.logger.interceptor";
import { AdminLogMessage } from "Interceptors/admin logger interceptor/message-decorator";
import { PersonalLogMessage } from "Interceptors/personal logger interceptor interceptor/personal-message-decorator";

@Controller('terms')
export class termsController {

    constructor(
        private readonly term: termsService,
    ){}

    @Post('create')
    @UseGuards(ASTGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('created a new term')
    @PersonalLogMessage('You created a new term')
    async createTerm (@Req() req: Request & {user: any}, @Body() dto: termDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.term.setTerm(school_id, dto.number, dto.start_date, dto.end_date)
    }

    @Delete('delete/:id')
    @UseGuards(ASTGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('deleted a term')
    @PersonalLogMessage('You deleted a term')
    async deleteTerm (@Req() req: Request & {user: any}, @Param('id') id: string) {
        const school_id = req.user.app_metadata.school_id
        return await this.term.deleteTerm(school_id, id)
    }

    @Patch('/update/:id')
    @UseGuards(ASTGuard)
    @UseInterceptors(AdminLogger)
    @UseInterceptors(PersonalLogger)
    @AdminLogMessage('updated a term')
    @PersonalLogMessage('You updated a term')
    async updateTerm (@Req() req: Request & {user: any}, @Param('id') id: string, @Body() dto: UpdatetermDto) {
        const school_id = req.user.app_metadata.school_id
        return await this.term.updateTermDates(school_id, id, dto.start_date, dto.end_date)
    }

    @Get()
    @UseGuards(GlobalGuard)
    async getAllTerms (@Req() req: Request & {user: any}) {
        const school_id = req.user.app_metadata.school_id
        return await this.term.getAllTerms(school_id)
    }
}