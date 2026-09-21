// ── Tipos auxiliares ──────────────────────────────
export type TipoMarco = '7d' | '2m' | '1a';
export type StatusLembrete = 'pendente' | 'concluido';

// ── Marco de Acompanhamento ───────────────────────
// Gerado automaticamente a partir de uma Entrega (até 3 por entrega)
export interface MarcoAcompanhamento {
  marco_id: number;
  entrega_id: number;       // FK -> Entregas.entrega_id
  tipo: TipoMarco;
  data_alvo: string;        // ISO date
}

// ── Lembrete ───────────────────────────────────────
// Gerado 1:1 a partir de um Marco de Acompanhamento
export interface Lembrete {
  lembrete_id: number;
  marco_id: number;         // FK -> MarcoAcompanhamento.marco_id
  status: StatusLembrete;
  criado_em: string;
  concluido_em: string | null; // null enquanto status = 'pendente'
}

// ── Versão "expandida" para exibição hierárquica ──
// Usada onde a UI precisa mostrar o Lembrete junto do
// Marco que o originou (ex: CartaoLembrete, ListaAcompanhamentos)
export interface LembreteComMarco extends Lembrete {
  marco: MarcoAcompanhamento;
}

// Caso a UI precise ir na direção inversa (do Marco,
// ver o Lembrete que ele gerou — relação 1:1)
export interface MarcoComLembrete extends MarcoAcompanhamento {
  lembrete: Lembrete | null; // null se o lembrete ainda não foi gerado
}
