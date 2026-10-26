-- AlterTable
-- os marcos passam a ter os dias guardados no banco; os três do seed recebem os valores
-- que eram fixos no código e um rótulo legível no lugar do código ("7d" vira "7 dias")
ALTER TABLE "tipo_marco" ADD COLUMN     "diasAposEntrega" INTEGER;
ALTER TABLE "tipo_marco" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

UPDATE "tipo_marco" SET "diasAposEntrega" = 7, "nome" = '7 dias' WHERE "nome" = '7d';
UPDATE "tipo_marco" SET "diasAposEntrega" = 60, "nome" = '2 meses' WHERE "nome" = '2m';
UPDATE "tipo_marco" SET "diasAposEntrega" = 365, "nome" = '1 ano' WHERE "nome" = '1a';
-- qualquer outro registro (não deveria existir) recebe um valor único para não quebrar o NOT NULL
UPDATE "tipo_marco" SET "diasAposEntrega" = 10000 + "id" WHERE "diasAposEntrega" IS NULL;

ALTER TABLE "tipo_marco" ALTER COLUMN "diasAposEntrega" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tipo_marco_diasAposEntrega_key" ON "tipo_marco"("diasAposEntrega");

-- busca de clientes sem diferenciar acento ("joao" acha "João")
CREATE EXTENSION IF NOT EXISTS unaccent;
