import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class uploadNotesDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    title!: string

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    @Transform(sanitize)
    message?: string
}

@Injectable()
export class updateNotesDTO {

    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Transform(sanitize)
    title?: string

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    @Transform(sanitize)
    message?: string
}
