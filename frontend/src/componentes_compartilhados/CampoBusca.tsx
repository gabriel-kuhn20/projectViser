type PropriedadesCampoBusca = {
    rotulo: string;
    valor: string;
    aoAlterar: (novoValor: string) => void;
    placeholder?: string;
};

// filtra enquanto digita — por isso não fica dentro de um <form> nem tem botão de buscar
export function CampoBusca({ rotulo, valor, aoAlterar, placeholder }: PropriedadesCampoBusca) {
    return (
        <label className="campo-texto-rotulo mb-0 w-full sm:w-80">
            {rotulo}
            <input
                type="search"
                value={valor}
                placeholder={placeholder}
                onChange={(evento) => aoAlterar(evento.target.value)}
                className="campo-texto-input"
            />
        </label>
    );
}
