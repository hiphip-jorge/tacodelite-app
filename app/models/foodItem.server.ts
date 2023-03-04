import type { FoodItem } from "@prisma/client";

import { prisma } from "~/db.server";

import {getCategory} from "../../prisma/seed-utils"

export type {FoodItem} from "@prisma/client";

import { redirect } from "@remix-run/node";


export async function createFoodCategories() {
    const categoryExist = await prisma.category.findMany({where: {id: 1}});

    if (categoryExist.length){ 
        console.log("400: Categories Exist.")
        return null;
    }

    return Promise.all(getCategory().map((category) => {
        return prisma.category.create({data: category});
    }));
}

export function getFoodItem({id}:Pick<FoodItem, "id">) {
    return prisma.foodItem.findFirst({where: {id: id}});
}

export function getFoodItemList() {
    return prisma.foodItem.findMany({orderBy: {id: "asc"}})
}

export function createFoodItem({name, description, price, active=true, vegetarian=false, category} : Pick<FoodItem, "name" | "description" | "price" | "active" | "vegetarian"> & {category: string}) {
    const categoryId = getCategory().find(item => item.name.toLowerCase() === category.toLowerCase());

    return prisma.foodItem.create({
        data: {
            name,
            description,
            price,
            categoryId: categoryId?.id,
            active,
            vegetarian
        }
    })
}

export function updateFoodItem({name, description, price, categoryId, active, vegetarian, id} : Pick<FoodItem, "name" | "description" | "price" | "categoryId" | "active" | "vegetarian" > & Pick<FoodItem, "id">){
    return prisma.foodItem.update({
        where: {
            id,
          },
          data: {name, description, price, categoryId, active, vegetarian},
    })
}

export function deleteFoodItem({id}:Pick<FoodItem, "id">){
    return prisma.foodItem.delete({where: {id}})
}
