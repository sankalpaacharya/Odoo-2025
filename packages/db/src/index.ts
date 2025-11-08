import { PrismaClient, Prisma } from "../prisma/generated/client";
const prisma = new PrismaClient();

export { prisma as db, Prisma };
export default prisma;
