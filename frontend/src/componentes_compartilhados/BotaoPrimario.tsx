type PropriedadesBotaoPrimario = {
  texto: string;
  aoClicar?: () => void;
  tipo?: "button" | "submit";
  variante?: "primary" | "secondary" | "danger" | "outline-primary" | "outline-danger" | "outline-light";
  desabilitado?: boolean;
};

export function BotaoPrimario({
                                texto,
                                aoClicar,
                                tipo = "button",
                                variante = "primary",
                                desabilitado = false,
                              }: PropriedadesBotaoPrimario) {
  return (
      <button type={tipo} className={`btn btn-${variante}`} onClick={aoClicar} disabled={desabilitado}>
        {texto}
      </button>
  );
}