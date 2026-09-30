type PropriedadesCampoTexto = {
    rotulo: string;
    valor: string;
    aoAlterar: (novoValor: string) => void;
    tipo?: string;
    obrigatorio?: boolean;
};

export function CampoTexto({ rotulo, valor, aoAlterar, tipo = "text", obrigatorio = false }: PropriedadesCampoTexto) {
    return (
        <div className="mb-3">
            <label className="form-label w-100">
                {rotulo}
                <input
                    className="form-control"
                    type={tipo}
                    value={valor}
                    required={obrigatorio}
                    onChange={(evento) => aoAlterar(evento.target.value)}
                />
            </label>
        </div>
    );
}