import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

@Injectable()
export class parentDTO {

    @IsEmail()
    @MaxLength(30)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    email!: string

    @IsString()
    @MaxLength(25)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name!: string

    @IsString()
    @MaxLength(15)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    phone!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    id!: string

    //// auth

    @IsString()
    @MaxLength(20)
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
export class updateParentDTO {

    @IsEmail()
    @MaxLength(30)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_email!: string

    @IsString()
    @MaxLength(25)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_name!: string

    @IsString()
    @MaxLength(15)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_phone!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    id!: string

    //// auth

    @IsString()
    new_password!: string

    @IsString()
    @MaxLength(6)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    token!: string

}

@Injectable()
export class optionalParentDTO {

    @IsString()
    @IsOptional()
    @MaxLength(25)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name?: string

    @IsString()
    @IsOptional()
    phone?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    id!: string
}