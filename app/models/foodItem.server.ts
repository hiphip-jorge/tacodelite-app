
import { prisma } from "~/db.server";
import type { FoodItem } from "@prisma/client";

import {getCategory} from "../../prisma/seed-utils"
import tacodelite from "../../prisma/tacodelite.menu.json"

export type {FoodItem} from "@prisma/client"

export async function seedCategories() {
    const categoryExist = await prisma.category.findMany({where: {id: 1}});

    if (categoryExist.length){ 
        console.log("400: Categories Exist.")
        return [];
    }

    return Promise.all(getCategory().map((category) => {
        return prisma.category.create({data: category});
    }));
}

export async function seedFoodItems() {
    const foodItemsExist = await prisma.foodItem.findMany({where: {id: 1}});

    if (foodItemsExist.length){ 
        console.log("400: Original Food Items Exist.")
        return [];
    }

    return Promise.all(tacodelite.foodItems.map((item) => {
        return prisma.foodItem.create({data: item});
    }));
}

export function getCategoryList() {
    return prisma.category.findMany({orderBy: {id: "asc"}})
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
