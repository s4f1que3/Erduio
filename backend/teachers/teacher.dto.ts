import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class CreateTeacherDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    email!: string

    @IsString()
    @MaxLength(70)
    password!: string

    @IsString()
    @MaxLength(60)
    @Transform(sanitize)
    name!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    phone!: string
}

@Injectable()
export class AdminUpdateTeacherInfoDTO {

    @IsString()
    @IsOptional()
    @MaxLength(60)
    @Transform(sanitize)
    name?: string

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @Transform(sanitize)
    phone?: string
}

@Injectable()
export class AdminUpdateTeacherPasswordDTO {

    @IsString()
    @MaxLength(70)
    new_password!: string
}

@Injectable()
export class AdminUpdateTeacherEmailDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    new_email!: string
}

///// TEACHER PERSONAL

@Injectable()
export class UpdateTeacherEmailPersonalDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    new_email!: string

    @IsString()
    @MaxLength(6)
    @Transform(sanitize)
    token!: string
}

@Injectable()
export class UpdateTeacherPasswordPersonalDTO {

    @IsString()
    @MaxLength(70)
    current_password!: string

    @IsString()
    @MaxLength(70)
    new_password!: string
}

@Injectable()
export class UpdateTeacherInfoPersonalDTO {

    @IsString()
    @IsOptional()
    @MaxLength(60)
    @Transform(sanitize)
    new_name?: string

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @Transform(sanitize)
    new_phone?: string
}
