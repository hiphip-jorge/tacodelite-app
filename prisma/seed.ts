import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getCategory, getAnnouncement } from "./seed-utils";
import tacodelite from './tacodelite.menu.json'

const prisma = new PrismaClient();

async function seed() {
  const email = "jorgeperez.inbox@gmail.com";
  const role = "ADMIN"

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("jorgeiscool", 10);

  await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      role  
    },
  });

  await Promise.all(
    [...getAnnouncement().map((announcement) => {
      return prisma.announcement.create({ data: announcement });
    }), ...getCategory().map((category) => {
      return prisma.category.create({data: category})
    }), ...tacodelite.foodItems.map((foodItem) => {
      return prisma.foodItem.create({data: foodItem})
    })]
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
