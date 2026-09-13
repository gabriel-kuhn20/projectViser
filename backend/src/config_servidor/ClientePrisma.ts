import { PrismaClient } from "@prisma/client";

// instância única do Prisma reaproveitada em toda a aplicação
export const clientePrisma = new PrismaClient();
