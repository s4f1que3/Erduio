import { IsEmail, IsString, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class emailDTO {

    @IsString()
    @MaxLength(60)
    @Transform(sanitize)
    subject!: string

    @IsString()
    @MaxLength(250)
    @Transform(sanitize)
    message!: string
}