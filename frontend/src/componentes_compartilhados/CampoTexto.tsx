type PropriedadesCampoTexto = {
  rotulo: string;
  valor: string;
  aoAlterar: (novoValor: string) => void;
};

export function CampoTexto({ rotulo, valor, aoAlterar }: PropriedadesCampoTexto) {
  return (
    <label>
      {rotulo}
      <input value={valor} onChange={(evento) => aoAlterar(evento.target.value)} />
    </label>
  );
}
