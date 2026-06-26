import { IsString } from "class-validator"
import { Injectable } from "@nestjs/common"
import { Transform } from "class-transformer"

@Injectable()
export class fileDTO {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    title!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    description!: string

}