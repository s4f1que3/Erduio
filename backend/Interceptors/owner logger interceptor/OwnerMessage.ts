import { SetMetadata } from "@nestjs/common";
export const OwnerMessage = (message: string) => SetMetadata('OwnerMessage', message)