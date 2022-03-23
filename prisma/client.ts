import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient = null;
export const getPrismaClient = async (): Promise<PrismaClient> => {
  if (!prisma) {
    prisma = new PrismaClient();
  }

  try {
    await prisma.$connect();
  } catch (error) {
    throw error;
  }

  return prisma;
};