import { SetMetadata } from "@nestjs/common";
export const SALMessage = (message: string) => SetMetadata('SALMessage', message)