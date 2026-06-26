import { SetMetadata } from "@nestjs/common";
export const ParentMessage = (message: string) => SetMetadata('ParentMessage', message)