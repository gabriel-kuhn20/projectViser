type PropriedadesCampoTexto = {
  rotulo: string;
  valor: string;
  aoAlterar: (novoValor: string) => void;
  tipo?: string;
};

export function CampoTexto({ rotulo, valor, aoAlterar, tipo = "text" }: PropriedadesCampoTexto) {
  return (
    <label className="campo-texto-rotulo">
      {rotulo}
      <input
        type={tipo}
        value={valor}
        onChange={(evento) => aoAlterar(evento.target.value)}
        className="campo-texto-input"
      />
    </label>
  );
}
