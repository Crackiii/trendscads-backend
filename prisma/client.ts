import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient = null;
export const getPrismaClient = async (): Promise<PrismaClient> => {
  if (!prisma) {
    prisma = new PrismaClient();
  }

  try {
    await prisma.$connect();
    console.log("Connected to Postgres via Prisma client");
  } catch (error) {
    console.log(error);
    throw error;
  }

  return prisma;
};