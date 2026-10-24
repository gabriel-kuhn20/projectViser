type PropriedadesCampoTexto = {
    rotulo: string;
    valor: string;
    aoAlterar: (novoValor: string) => void;
    tipo?: string;
    obrigatorio?: boolean;
    placeholder?: string;
    autoComplete?: string;
};

export function CampoTexto({
    rotulo,
    valor,
    aoAlterar,
    tipo = "text",
    obrigatorio = false,
    placeholder,
    autoComplete,
}: PropriedadesCampoTexto) {
    return (
        <label className="campo-texto-rotulo">
            {rotulo}
            <input
                type={tipo}
                value={valor}
                required={obrigatorio}
                placeholder={placeholder}
                autoComplete={autoComplete}
                onChange={(evento) => aoAlterar(evento.target.value)}
                className="campo-texto-input"
            />
        </label>
    );
}
