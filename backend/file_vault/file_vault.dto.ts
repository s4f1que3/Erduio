import { IsString, MaxLength } from "class-validator";
import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class fileDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    title!: string

    @IsString()
    @MaxLength(500)
    @Transform(sanitize)
    description!: string
}
