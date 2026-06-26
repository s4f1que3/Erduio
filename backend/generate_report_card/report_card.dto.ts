import { IsInt, IsArray, ValidateNested, Min, Max, IsUUID, IsString, IsOptional } from "class-validator";
import { Transform, Type } from "class-transformer";

class GradeRecord {
    @IsUUID()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    student_id!: string

    @IsInt()
    @Min(0)
    @Max(100)
    grade!: number

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    comment?: string
}

export class SubmitGradesDTO {
    @IsInt()
    term!: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeRecord)
    records!: GradeRecord[]
}

class StudentGradeRecord {
    @IsUUID()
    class_subject_id!: string

    @IsInt()
    @Min(0)
    @Max(100)
    grade!: number

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    comment?: string
}

export class SubmitStudentGradesDTO {
    @IsInt()
    term!: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentGradeRecord)
    records!: StudentGradeRecord[]
}
