import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, IsOptional, IsNumber, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class termDto {

    @IsNumber()
    number!: number

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    start_date!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    end_date!: string
}

@Injectable()
export class UpdatetermDto {

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @Transform(sanitize)
    start_date?: string

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @Transform(sanitize)
    end_date?: string
}
