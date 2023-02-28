import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getCategory, getAnnouncement } from "./seed-utils";
import tacodelite from './tacodelite.menu.json'

const prisma = new PrismaClient();

async function seed() {
  const emailJorge = "jorgeperez.inbox@gmail.com";
  const nameJorge = "Jorge"
  const emailJavier = "tacodelitewestplano@gmail.com"
  const nameJavier = "Javier"
  const role = "ADMIN"



  // cleanup the existing database
  await prisma.user.delete({ where: { email: emailJavier } }).catch(() => {
    // no worries if it doesn't exist yet
  });
  await prisma.user.delete({ where: { email: emailJorge } }).catch(() => {
    // no worries if it doesn't exist yet
  });
  
  const hashedPasswordJorge = await bcrypt.hash("mygreatTDpw96", 10);
  const hashedPasswordJavier = await bcrypt.hash("blueHORSE73", 10);

  await prisma.user.create({
    data: {
      email:nameJavier,
      name: nameJavier,
      password: {
        create: {
          hash: hashedPasswordJavier,
        },
      },
      role  
    },
  });

  await prisma.user.create({
    data: {
      email:nameJorge,
      name:nameJorge,
      password: {
        create: {
          hash: hashedPasswordJorge,
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
