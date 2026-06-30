import { Injectable } from "@nestjs/common";
import { IsString, IsOptional, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class AddExamGradeDTO {

    @IsString()
    @MaxLength(10)
    @Transform(sanitize)
    grade!: string

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Transform(sanitize)
    message?: string
}

@Injectable()
export class UpdateExamGradeDTO {

    @IsString()
    @IsOptional()
    @MaxLength(10)
    @Transform(sanitize)
    new_grade?: string

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Transform(sanitize)
    new_message?: string
}
