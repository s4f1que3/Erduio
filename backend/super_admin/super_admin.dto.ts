import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class UpdateSuperAdminInfoPersonalDTO {

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

@Injectable()
export class UpdateSuperAdminEmailPersonalDTO {

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
export class UpdateSuperAdminPasswordPersonalDTO {

    @IsString()
    @MaxLength(70)
    current_password!: string

    @IsString()
    @MaxLength(70)
    new_password!: string
}
