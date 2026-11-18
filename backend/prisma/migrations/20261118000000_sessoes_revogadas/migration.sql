-- AlterTable
ALTER TABLE "usuario" ADD COLUMN "sessoesValidasDesde" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "token_revogado" (
    "jti" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_revogado_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "token_revogado_expiraEm_idx" ON "token_revogado"("expiraEm");
