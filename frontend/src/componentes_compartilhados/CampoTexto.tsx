type PropriedadesCampoTexto = {
    rotulo: string;
    valor: string;
    aoAlterar: (novoValor: string) => void;
    tipo?: string;
    obrigatorio?: boolean;
};

export function CampoTexto({ rotulo, valor, aoAlterar, tipo = "text", obrigatorio = false }: PropriedadesCampoTexto) {
    return (
        <label className="campo-texto-rotulo">
            {rotulo}
            <input
                type={tipo}
                value={valor}
                required={obrigatorio}
                onChange={(evento) => aoAlterar(evento.target.value)}
                className="campo-texto-input"
            />
        </label>
    );
}