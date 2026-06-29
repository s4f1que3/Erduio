import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

@Injectable()
export class schoolDTO {

    @IsString()
    @IsOptional()
    @MaxLength(25)
    @IsEmail()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    email?: string

    @IsString()
    @MaxLength(65)
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name?: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    phone?: string

    @IsString()
    @IsOptional()
    @MaxLength(130)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    address?: string
}