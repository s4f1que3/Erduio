import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional, IsNumber, MaxLength } from "class-validator";

@Injectable()
export class termDto {

    @IsNumber()
    number!: number

    @IsString()
    @MaxLength(10)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    start_date!: string

    @IsString()
    @MaxLength(10)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    end_date!: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    term_id!: string
}

@Injectable()
export class UpdatetermDto {

    @IsNumber()
    number!: number

    @IsString()
    @IsOptional()
    @MaxLength(10)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    start_date?: string

    @IsString()
    @IsOptional()
    @MaxLength(10)
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    end_date?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
    term_id!: string;
}