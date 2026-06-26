import { SetMetadata } from "@nestjs/common";
export const SAMessage = (message: string) => SetMetadata('SAMessage', message)