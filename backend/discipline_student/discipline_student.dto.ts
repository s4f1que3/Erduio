import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class disciplineDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    action!: string

    @IsString()
    @MaxLength(2000)
    @Transform(sanitize)
    message!: string

    @IsString()
    @MaxLength(20)
    @Transform(sanitize)
    date!: string
}
