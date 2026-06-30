import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class CreateExamDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    name!: string

    @IsString()
    @MaxLength(3000)
    @Transform(sanitize)
    content!: string
}

@Injectable()
export class UpdateExamDTO {

    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Transform(sanitize)
    new_name?: string

    @IsString()
    @IsOptional()
    @MaxLength(3000)
    @Transform(sanitize)
    new_content?: string
}
