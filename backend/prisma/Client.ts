import { PrismaClient } from "@prisma/client";
import { extensaoLembrete } from "./extensions/lembrete";

export const prisma = new PrismaClient().$extends(extensaoLembrete);