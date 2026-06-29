import { SetMetadata } from "@nestjs/common";
export const ParentAnnouncementMessage = (message: string) => SetMetadata('ParentAnnouncementMessage', message)