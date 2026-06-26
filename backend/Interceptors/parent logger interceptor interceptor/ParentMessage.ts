import { SetMetadata } from "@nestjs/common";
export const ParentLogMessage = (message: string) => SetMetadata('ParentLogMessage', message)