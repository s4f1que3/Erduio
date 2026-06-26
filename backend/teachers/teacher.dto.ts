import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

@Injectable()
export class teacherDTO {

    @IsEmail()
    @MaxLength(48)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    email!: string

    @IsString()
    @MaxLength(35)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name!: string

    @IsString()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    phone!: string

    //// auth

    @IsString()
    @MaxLength(20)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    password!: string

    @IsString()
    @MaxLength(6)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    token!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    school_id!: string

}

@Injectable()
export class updateTeacherDTO {

    @IsEmail()
    @MaxLength(48)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_email!: string

    @IsString()
    @MaxLength(35)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_name!: string

    @IsString()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_phone!: string

    //// auth

    @IsString()
    @MaxLength(20)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_password!: string

    @IsString()
    @MaxLength(6)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    token!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    school_id!: string

}

@Injectable()
export class optionalTeacherDTO {

    @IsString()
    @IsOptional()
    @MaxLength(35)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name?: string

    @IsString()
    @IsOptional()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    phone?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    school_id!: string


}