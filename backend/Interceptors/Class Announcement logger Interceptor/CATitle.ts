import { SetMetadata } from "@nestjs/common";
export const CATitle = (message: string) => SetMetadata('CATitle', message)