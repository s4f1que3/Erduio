import { IsString, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class subjectAttendanceRecord {
    @IsString()
    student_id!: string

    @IsBoolean()
    present!: boolean
}

export class subjectAttendanceDTO {
    @IsString()
    date!: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => subjectAttendanceRecord)
    records!: subjectAttendanceRecord[]
}