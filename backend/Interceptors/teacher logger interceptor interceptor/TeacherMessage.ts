import { SetMetadata } from "@nestjs/common";
export const TeacherLogMessage = (message: string) => SetMetadata('TeacherLogMessage', message)