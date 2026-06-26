import { SetMetadata } from "@nestjs/common";
export const ParentTitle = (message: string) => SetMetadata('ParentTitle', message)