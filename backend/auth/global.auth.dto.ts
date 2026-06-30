import { Injectable } from "@nestjs/common";
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class VerifyOtpDTO {

    @IsString()
    @MaxLength(6)
    @Transform(sanitize)
    token!: string
}

@Injectable()
export class VerifyPasswordDTO {

    @IsString()
    @MaxLength(70)
    password!: string
}

@Injectable()
export class LoginDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.toLowerCase().trim() : value)
    email!: string

    @IsString()
    @MaxLength(70)
    password!: string
}

@Injectable()
export class RefreshDTO {

    @IsString()
    @MaxLength(500)
    refresh_token!: string
}
