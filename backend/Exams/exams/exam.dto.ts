import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional } from "class-validator";

@Injectable()
export class examDTO {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    content!: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_name?: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_content?: string
}