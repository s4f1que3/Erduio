import { SetMetadata } from "@nestjs/common";
export const SPAMessage = (message: string) => SetMetadata('SPAMessage', message)