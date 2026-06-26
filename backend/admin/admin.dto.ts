import { IsString, IsEmail, IsOptional, IsNotEmpty } from "class-validator";
import { Injectable } from "@nestjs/common";

@Injectable()
export class adminDTO {

    @IsString()
    password!: string

    @IsEmail()
    email!: string

    @IsString()
    name!: string

    @IsString()
    phone!: string

    @IsString()
    token!: string

    @IsString()
    school_id!: string
}

@Injectable()
export class updatedAdminDTO {

    @IsString()
    new_password!: string

    @IsOptional()
    @IsEmail()
    new_email!: string

    @IsOptional()
    @IsString()
    new_name?: string

    @IsOptional()
    @IsString()
    new_phone?: string

    @IsString()
    token!: string

}
