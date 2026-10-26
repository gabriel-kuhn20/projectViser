-- AlterTable
-- entregas já cadastradas não têm produto: recebem "não informado" para o campo
-- continuar obrigatório (PRD, seção 8); o default sai logo depois para as novas
ALTER TABLE "entrega" ADD COLUMN     "produto" TEXT NOT NULL DEFAULT 'não informado';
ALTER TABLE "entrega" ALTER COLUMN "produto" DROP DEFAULT;
