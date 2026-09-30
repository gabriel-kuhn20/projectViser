import "dotenv/config";
import { criarAplicacaoExpress } from "./config_servidor/AplicacaoExpress";
import { obterSegredoJwt } from "./config_servidor/ConfiguracaoAmbiente";
import { iniciarAgendadorMarcos } from "./rotina_marcos/AgendadorMarcos";

// falha na inicialização se JWT_SEGREDO não estiver definido
obterSegredoJwt();

const porta = process.env.PORTA ?? 3333;
const app = criarAplicacaoExpress();

app.listen(porta, () => {
  console.log(`servidor rodando na porta ${porta}`);
});

// UC04: rotina agendada, não efeito colateral de tela aberta (PRD, seção 9)
iniciarAgendadorMarcos();