-- CreateIndex
-- só um atendente por vez tratando um lembrete (RF08/UC09 A1)
CREATE UNIQUE INDEX "em_atendimento_lembreteId_key" ON "em_atendimento"("lembreteId");
