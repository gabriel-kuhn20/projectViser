type PropriedadesCampoTexto = {
  rotulo: string;
  valor: string;
  aoAlterar: (novoValor: string) => void;
  tipo?: string;
};

export function CampoTexto({ rotulo, valor, aoAlterar, tipo = "text" }: PropriedadesCampoTexto) {
  return (
      <label>
        {rotulo}
        <input type={tipo} value={valor} onChange={(evento) => aoAlterar(evento.target.value)} />
      </label>
  );
}