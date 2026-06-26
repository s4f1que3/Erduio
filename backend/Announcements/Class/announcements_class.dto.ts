import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional } from "class-validator";

@Injectable()
export class classAnnouncementDTO {
    
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    title!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    content!: string

    @IsString()
    upload_url!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    school_id!: string

    @IsOptional()
    upload?: Express.Multer.File
}