import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional, MaxLength } from "class-validator";

@Injectable()
export class GenAnnouncementDTO {
    
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    title!: string

    @IsString()
    @MaxLength(3000)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    content!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    upload_url!: string

    @IsOptional()
    upload?: Express.Multer.File
}