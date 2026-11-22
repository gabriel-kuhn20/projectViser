/*
  Warnings:

  - You are about to drop the column `responsavelId` on the `cliente` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cliente" DROP CONSTRAINT "cliente_responsavelId_fkey";

-- AlterTable
ALTER TABLE "cliente" DROP COLUMN "responsavelId";
