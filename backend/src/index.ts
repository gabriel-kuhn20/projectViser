import "dotenv/config";
import { criarAplicacaoExpress } from "./config_servidor/AplicacaoExpress";
import { iniciarAgendadorMarcos } from "./rotina_marcos/AgendadorMarcos";

const porta = process.env.PORTA ?? 3333;
const app = criarAplicacaoExpress();

app.listen(porta, () => {
  console.log(`servidor rodando na porta ${porta}`);
});

// UC04: roda como rotina agendada, não como efeito colateral de tela aberta
// (ver seção 9 do PRD, "Decisões de implementação").
iniciarAgendadorMarcos();
