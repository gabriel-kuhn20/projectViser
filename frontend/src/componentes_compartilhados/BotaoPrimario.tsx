type PropriedadesBotaoPrimario = {
  texto: string;
  aoClicar: () => void;
  tipo?: "button" | "submit";
  desabilitado?: boolean;
};

export function BotaoPrimario({
  texto,
  aoClicar,
  tipo = "submit",
  desabilitado = false,
}: PropriedadesBotaoPrimario) {
  return (
    <button
      type={tipo}
      onClick={aoClicar}
      disabled={desabilitado}
      className="botao-primario"
    >
      {texto}
    </button>
  );
}
