import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class CreateClassDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    name!: string

    @IsString()
    @IsOptional()
    @Transform(sanitize)
    class_teacher?: string

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(50)
    subjects?: unknown[]
}

@Injectable()
export class AddSubjectsDTO {

    @IsArray()
    @ArrayMaxSize(50)
    subjects!: unknown[]
}

@Injectable()
export class ChangeClassTeacherDTO {

    @IsString()
    @Transform(sanitize)
    class_teacher!: string
}

@Injectable()
export class ChangeClassNameDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    name!: string
}

@Injectable()
export class RemoveSubjectsDTO {

    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    subjects!: string[]
}

@Injectable()
export class RemoveTimetableDTO {

    @IsString()
    @Transform(sanitize)
    path!: string
}

@Injectable()
export class UpdateSubjectDTO {

    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Transform(sanitize)
    name?: string

    @IsString()
    @IsOptional()
    @Transform(sanitize)
    teacher_id?: string
}
