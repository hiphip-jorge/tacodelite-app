import type { FoodItem } from "@prisma/client";

import { prisma } from "~/db.server";

import {getCategory} from "../../prisma/seed-utils"

export type {FoodItem} from "@prisma/client";

export function getFoodItem({id}:Pick<FoodItem, "id">) {
    return prisma.foodItem.findFirst({where: {id: id}});
}

export function getFoodItemList() {
    return prisma.foodItem.findMany({orderBy: {id: "asc"}})
}

export function createFoodItem({name, description, price, category} : Pick<FoodItem, "name" | "description" | "price"> & {category: string}) {
    const categoryId = getCategory().find(item => item.name.toLowerCase() === category.toLowerCase());

    return prisma.foodItem.create({
        data: {
            name,
            description,
            price,
            categoryId: categoryId?.id
        }
    })
}

export function deleteFoodItem({id}:Pick<FoodItem, "id">){
    return prisma.foodItem.delete({where: {id}})
}
