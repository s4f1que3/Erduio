import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

@Injectable()
export class studentDTO {

    @IsString()
    @IsOptional()
    @MaxLength(48)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    parent_email?: string

    @IsString()
    @MaxLength(20)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    parent_password!: string 

    @IsString()
    @MaxLength(35)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    parent_name!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    parent_id!: string

    @IsString()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    parent_phone!: string

    @IsString()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_phone!: string

    @IsString()
    @IsOptional()
    @MaxLength(48)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    student_email?: string

    @IsString()
    @MaxLength(16)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    student_password!: string

    @IsString() 
    @MaxLength(35)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    student_name!: string

    @IsString()
    @IsOptional()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    student_phone?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    classID!: string

    @IsString()
    @MaxLength(6)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    token!: string

    @IsBoolean()
    is_creating!: boolean

    @IsArray()
    subjects!: string[]

}

@Injectable()
export class regStudentDTO {

    @IsString()
    @MaxLength(6)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    token!: string

    @IsString()
    @MaxLength(20)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    password!: string

    @IsString()
    @MaxLength(48)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    email!: string

    @IsString()
    @MaxLength(48)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    student_email!: string

    @IsString()
    @MaxLength(13)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    phone!: string

    @IsString()
    @MaxLength(35)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name!: string

    @IsString()
    @MaxLength(20)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    status!: string

    @IsArray()
    @IsOptional()
    subjects?: string[]

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    parent_id!: string

}
