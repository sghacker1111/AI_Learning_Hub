import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Route handlers report safe error codes; raw engine errors can include connection details.
    log: [],
    // Small database-only transactions need room for hosted-network latency/cold starts.
    transactionOptions: { maxWait: 10000, timeout: 15000 },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
export default prisma;
