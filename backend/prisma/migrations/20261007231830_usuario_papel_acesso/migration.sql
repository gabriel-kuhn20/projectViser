-- CreateEnum
CREATE TYPE "PapelAcesso" AS ENUM ('admin', 'atendente');

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "papelAcesso" "PapelAcesso" NOT NULL DEFAULT 'atendente';
