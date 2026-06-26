import { SetMetadata } from "@nestjs/common";
export const SATitle = (message: string) => SetMetadata('SATitle', message)