import { Injectable } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsString, MaxLength } from "class-validator";

const sanitize = ({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value;

@Injectable()
export class UploadReportCardDTO {

    @IsString()
    @MaxLength(100)
    @Transform(sanitize)
    title!: string
}
