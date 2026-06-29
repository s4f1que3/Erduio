import { SetMetadata } from "@nestjs/common";
export const ParentPersonalMessage = (message: string) => SetMetadata('ParentPersonalMessage', message)