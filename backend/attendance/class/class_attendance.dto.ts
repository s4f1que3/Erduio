import { IsString, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AttendanceRecord {
    @IsString()
    student_id!: string

    @IsBoolean()
    present!: boolean
}

export class classAttendanceDTO {
    @IsString()
    date!: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecord)
    records!: AttendanceRecord[]
}
