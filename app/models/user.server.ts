import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"] | undefined) {
  return prisma.user.findUnique({ where: { id } });
}

export function getUserList() {
  return prisma.user.findMany({orderBy: {id: "asc"}})
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(name:string, email: User["email"], password: string, role='MEMBER') {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      role
    },
  });
}

export async function updateUser(id: User["id"] | undefined, name: User["name"] | undefined, email: User["email"] | undefined, role: User["role"]) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {name, email, role}
  })
}

export async function deleteUserById(id: User["id"]) {
  return prisma.user.delete({ where: { id } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
