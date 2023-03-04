import type { Announcement } from "@prisma/client";

import { prisma } from "~/db.server";

export type {Announcement} from "@prisma/client";

export function getAnnouncementById(id: Announcement["id"] |undefined) {
    return prisma.announcement.findFirst({where: {id}});
}

export function getAnnoncementList() {
    return prisma.announcement.findMany({orderBy: {startDate: "desc"}})
}

export function createAnnouncement({endDate, title, message} : Pick<Announcement, "endDate" | "title" | "message">) {
    const startDate = new Date();
    return prisma.announcement.create({data: {startDate, title, endDate, message}});
}

export function updateAnnouncement({id, endDate, message}:Pick<Announcement,"id" | "endDate" | "message">){
    return prisma.announcement.update({
        where: {id},
        data: {endDate, message},
    })
}

export function deleteAnnouncement({id}:Pick<Announcement, "id">){
    return prisma.announcement.delete({where: {id}})
}
