import { PrismaClient, Prisma } from "../prisma/generated/client";
const prisma = new PrismaClient();

export { prisma as db, Prisma };
export * from "../prisma/generated/enums";
export * from "../uploads/config";
export default prisma;
