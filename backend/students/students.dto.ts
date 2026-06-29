import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class CreateStudentWithNewParentDTO {

    @IsString()
    @MaxLength(60)
    @Transform(sanitize)
    student_name!: string

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    student_email!: string

    @IsString()
    @MaxLength(70)
    student_password!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    student_phone!: string

    @IsString()
    @Transform(sanitize)
    classID!: string

    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    subjects!: string[]

    @IsString()
    @MaxLength(60)
    @Transform(sanitize)
    parent_name!: string

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    parent_email!: string

    @IsString()
    @MaxLength(70)
    parent_password!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    parent_phone!: string

    @IsBoolean()
    is_creating!: boolean
}

@Injectable()
export class CreateStudentWithExistingParentDTO {

    @IsString()
    @MaxLength(60)
    @Transform(sanitize)
    student_name!: string

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    student_email!: string

    @IsString()
    @MaxLength(70)
    student_password!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    student_phone!: string

    @IsString()
    @Transform(sanitize)
    classID!: string

    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    subjects!: string[]

    @IsString()
    @Transform(sanitize)
    parent_id!: string

    @IsBoolean()
    is_creating!: boolean
}

@Injectable()
export class UpdateStudentEnrollmentStatusDTO {

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    status!: string
}

@Injectable()
export class AdminUpdateStudentInfoDTO {

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
export class AdminUpdateStudentEmailDTO {

    @IsEmail()
    @MaxLength(75)
    @Transform(sanitize)
    email!: string
}

@Injectable()
export class AdminUpdateStudentPasswordDTO {

    @IsString()
    @MaxLength(70)
    password!: string
}

@Injectable()
export class UpdateStudentClassDTO {

    @IsString()
    @Transform(sanitize)
    class_id!: string

    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    subjects!: string[]
}

@Injectable()
export class UpdateStudentSubjectsDTO {

    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    subjects!: string[]
}

///// STUDENT PERSONAL

@Injectable()
export class UpdateStudentEmailPersonalDTO {

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
export class UpdateStudentPasswordPersonalDTO {

    @IsString()
    @MaxLength(70)
    current_password!: string

    @IsString()
    @MaxLength(70)
    new_password!: string
}

@Injectable()
export class UpdateStudentPhoneDTO {

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    new_phone!: string

    @IsString()
    @MaxLength(6)
    @Transform(sanitize)
    token!: string
}
