import { Injectable } from "@nestjs/common";
import { IsString, IsBoolean, IsArray, ArrayMaxSize, ValidateNested, MaxLength } from "class-validator";
import { Transform, Type } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
class subjectAttendanceRecord {
    @IsString()
    @Transform(sanitize)
    student_id!: string

    @IsBoolean()
    present!: boolean
}

@Injectable()
export class subjectAttendanceDTO {
    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    date!: string

    @IsArray()
    @ArrayMaxSize(300)
    @ValidateNested({ each: true })
    @Type(() => subjectAttendanceRecord)
    records!: subjectAttendanceRecord[]
}
