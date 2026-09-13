type PropriedadesBotaoPrimario = {
  texto: string;
  aoClicar: () => void;
};

export function BotaoPrimario({ texto, aoClicar }: PropriedadesBotaoPrimario) {
  return <button onClick={aoClicar}>{texto}</button>;
}
