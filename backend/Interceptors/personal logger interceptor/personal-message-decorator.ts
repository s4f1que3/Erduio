import { SetMetadata } from "@nestjs/common";
export const PersonalLogMessage = (message: string) => SetMetadata('PersonalLogMessage', message)