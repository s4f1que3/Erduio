import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class CreateAssignmentDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    name!: string

    @IsString()
    @MaxLength(3000)
    @Transform(sanitize)
    description!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    due_date!: string

    @IsString()
    @Transform(sanitize)
    subject_id!: string
}

@Injectable()
export class ExtendAssignmentDTO {

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    due_date!: string
}

@Injectable()
export class GradeAssignmentDTO {

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
