import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class schoolDTO {

    @IsEmail()
    @IsOptional()
    @MaxLength(75)
    @Transform(sanitize)
    email?: string

    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Transform(sanitize)
    name?: string

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @Transform(sanitize)
    phone?: string

    @IsString()
    @IsOptional()
    @MaxLength(200)
    @Transform(sanitize)
    address?: string
}
