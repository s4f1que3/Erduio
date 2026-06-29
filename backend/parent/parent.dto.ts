import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class CreateParentLoginDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    email!: string

    @IsString()
    @MaxLength(70)
    password!: string
}

@Injectable()
export class AdminUpdateParentInfoDTO {

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
export class AdminUpdateParentPasswordDTO {

    @IsString()
    @MaxLength(70)
    new_password!: string
}

@Injectable()
export class AdminUpdateParentEmailDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    new_email!: string
}

///// PARENT PERSONAL

@Injectable()
export class UpdateParentEmailPersonalDTO {

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
export class UpdateParentPasswordPersonalDTO {

    @IsString()
    @MaxLength(70)
    current_password!: string

    @IsString()
    @MaxLength(70)
    new_password!: string
}

@Injectable()
export class UpdateParentInfoPersonalDTO {

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
