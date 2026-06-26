import { SetMetadata } from "@nestjs/common";
export const AdminLogMessage = (message: string) => SetMetadata('AdminLogMessage', message)