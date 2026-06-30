import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class personalAnnouncementDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    title!: string

    @IsString()
    @MaxLength(3000)
    @Transform(sanitize)
    content!: string
}
