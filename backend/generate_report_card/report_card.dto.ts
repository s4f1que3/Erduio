import { Injectable } from "@nestjs/common";
import { IsInt, IsArray, ArrayMaxSize, ValidateNested, Min, Max, IsUUID, IsString, IsOptional, MaxLength } from "class-validator";
import { Transform, Type } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
class GradeRecord {
    @IsUUID()
    @Transform(sanitize)
    student_id!: string

    @IsInt()
    @Min(0)
    @Max(100)
    grade!: number

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @Transform(sanitize)
    comment?: string
}

@Injectable()
export class SubmitGradesDTO {
    @IsInt()
    term!: number

    @IsArray()
    @ArrayMaxSize(300)
    @ValidateNested({ each: true })
    @Type(() => GradeRecord)
    records!: GradeRecord[]
}

@Injectable()
class StudentGradeRecord {
    @IsUUID()
    @Transform(sanitize)
    class_subject_id!: string

    @IsInt()
    @Min(0)
    @Max(100)
    grade!: number

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @Transform(sanitize)
    comment?: string
}

@Injectable()
export class SubmitStudentGradesDTO {
    @IsInt()
    term!: number

    @IsArray()
    @ArrayMaxSize(300)
    @ValidateNested({ each: true })
    @Type(() => StudentGradeRecord)
    records!: StudentGradeRecord[]
}
