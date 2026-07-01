import { Controller, Get} from "@nestjs/common";
import { Public } from "Extra Guards/public/public.metadata";
import { healthService } from "./health.service";

@Controller('health')
export class healthController {

    constructor(private readonly h: healthService){}

    @Get()
    @Public()
    async getHealth () {
        return await this.h.getHealth()
    }
}