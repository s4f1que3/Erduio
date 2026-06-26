import { SetMetadata } from "@nestjs/common";
export const CAMessage = (message: string) => SetMetadata('CAMessage', message)