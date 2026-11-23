-- AlterTable
ALTER TABLE "entrega" ADD COLUMN     "tiposMarcoIgnorados" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
