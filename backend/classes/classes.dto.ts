import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsArray } from "class-validator";

@Injectable()
export class classesDto {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    name!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    class_teacher!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    class_id!: string

    @IsString()
    timetable_url!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    status!: string

    @IsArray()
    subjects!: string[]

    @IsOptional()
    timetable!: Express.Multer.File
}

@Injectable()
export class updateClassesDto {

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    new_name?: string

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    class_teacher?: string

    @IsString()
    @IsOptional()
    timetable_url?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    status!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    class_id!: string

    @IsString()
    path!: string

    @IsArray()
    subjects!: string[]

    @IsOptional()
    new_timetable!: Express.Multer.File
}