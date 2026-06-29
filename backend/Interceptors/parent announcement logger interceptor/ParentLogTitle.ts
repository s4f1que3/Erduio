import { SetMetadata } from "@nestjs/common";
export const ParentAnnouncementTitle = (message: string) => SetMetadata('ParentAnnouncementTitle', message)