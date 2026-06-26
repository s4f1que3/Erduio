import { SetMetadata } from "@nestjs/common";
export const StudentLogMessage = (message: string) => SetMetadata('StudentLogMessage', message)