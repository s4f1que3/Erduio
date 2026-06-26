import { Injectable } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";

@Injectable()
export class updatesuperDto {

    @IsOptional()
    @IsString()
    new_name?: string

    @IsOptional()
    @IsString()
    new_email?: string

    @IsOptional()
    @IsString()
    new_phone?: string

    @IsString()
    new_password!: string

    @IsString()
    school_id!: string
}

Injectable()
export class superDto {

    @IsOptional()
    @IsString()
    name!: string

    @IsOptional()
    @IsString()
    email!: string

    @IsOptional()
    @IsString()
    phone!: string

    @IsString()
    password!: string

    @IsString()
    token!: string
}



@Injectable()
export class creationSuperAdminDTO {

    @IsString()
    creation_email!: string

    @IsString()
    creation_password!: string

    @IsString()
    creation_name!: string

    @IsString()
    creation_phone!: string


}

