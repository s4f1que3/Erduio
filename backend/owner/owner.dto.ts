import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class createSchoolDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    email!: string

    @IsString()
    @MaxLength(60)
    @Transform(sanitize)
    name!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    phone!: string

    @IsString()
    @MaxLength(130)
    @Transform(sanitize)
    address!: string
}

@Injectable()
export class updateSchoolDTO {

    @IsEmail()
    @MaxLength(75)
    @IsOptional()
    @Transform(sanitize)
    email?: string

    @IsString()
    @MaxLength(60)
    @IsOptional()
    @Transform(sanitize)
    name?: string

    @IsString()
    @MaxLength(20)
    @IsOptional()
    @Transform(sanitize)
    phone?: string

    @IsString()
    @MaxLength(130)
    @IsOptional()
    @Transform(sanitize)
    address?: string
}