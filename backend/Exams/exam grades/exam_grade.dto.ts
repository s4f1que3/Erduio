import { Injectable } from "@nestjs/common";
import { IsString, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

@Injectable()
export class examGradeDTO {

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    grade!: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    message!: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_message?: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_grade?: string
}