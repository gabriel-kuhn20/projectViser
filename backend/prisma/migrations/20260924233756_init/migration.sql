-- CreateEnum
CREATE TYPE "StatusLembrete" AS ENUM ('pendente', 'concluido');

-- CreateTable
CREATE TABLE "pessoa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "contato" TEXT NOT NULL,
    "endereco" TEXT,
    "responsavelId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_tag" (
    "clienteId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "vinculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_tag_pkey" PRIMARY KEY ("clienteId","tagId")
);

-- CreateTable
CREATE TABLE "entrega" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_marco" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_marco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marco_acompanhamento" (
    "id" SERIAL NOT NULL,
    "entregaId" INTEGER NOT NULL,
    "tipoMarcoId" INTEGER NOT NULL,
    "dataAlvo" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marco_acompanhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lembrete" (
    "id" SERIAL NOT NULL,
    "marcoId" INTEGER NOT NULL,
    "status" "StatusLembrete" NOT NULL DEFAULT 'pendente',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" TIMESTAMP(3),

    CONSTRAINT "lembrete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "em_atendimento" (
    "id" SERIAL NOT NULL,
    "lembreteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "em_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacao" (
    "id" SERIAL NOT NULL,
    "lembreteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "respostaCliente" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_pessoaId_key" ON "usuario"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_marco_nome_key" ON "tipo_marco"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "marco_acompanhamento_entregaId_tipoMarcoId_key" ON "marco_acompanhamento"("entregaId", "tipoMarcoId");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_tag" ADD CONSTRAINT "cliente_tag_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_tag" ADD CONSTRAINT "cliente_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marco_acompanhamento" ADD CONSTRAINT "marco_acompanhamento_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "entrega"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marco_acompanhamento" ADD CONSTRAINT "marco_acompanhamento_tipoMarcoId_fkey" FOREIGN KEY ("tipoMarcoId") REFERENCES "tipo_marco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lembrete" ADD CONSTRAINT "lembrete_marcoId_fkey" FOREIGN KEY ("marcoId") REFERENCES "marco_acompanhamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "em_atendimento" ADD CONSTRAINT "em_atendimento_lembreteId_fkey" FOREIGN KEY ("lembreteId") REFERENCES "lembrete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "em_atendimento" ADD CONSTRAINT "em_atendimento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacao" ADD CONSTRAINT "interacao_lembreteId_fkey" FOREIGN KEY ("lembreteId") REFERENCES "lembrete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacao" ADD CONSTRAINT "interacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
