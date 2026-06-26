import { SetMetadata } from "@nestjs/common";
export const SPATitle = (message: string) => SetMetadata('SPATitle', message)