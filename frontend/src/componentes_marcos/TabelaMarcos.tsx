import { type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";

type PropriedadesTabelaMarcos = {
    marcos: TipoMarcoApi[];
    carregando: boolean;
    marcoEmAcao: number | null;
    aoEditar: (marco: TipoMarcoApi) => void;
    aoAlternarAtivo: (marco: TipoMarcoApi) => void;
    aoExcluir: (marco: TipoMarcoApi) => void;
};

// marcos da tabela, do mais curto para o mais longo (a API já ordena pelos dias)
export function TabelaMarcos({ marcos, carregando, marcoEmAcao, aoEditar, aoAlternarAtivo, aoExcluir }: PropriedadesTabelaMarcos) {
    if (carregando) {
        return <div className="cartao mensagem-vazia">carregando marcos...</div>;
    }

    if (marcos.length === 0) {
        return <div className="cartao mensagem-vazia">nenhum marco cadastrado ainda.</div>;
    }

    return (
        <div className="cartao tabela-wrapper">
            <table className="tabela">
                <thead>
                <tr>
                    <th>Marco</th>
                    <th>Situação</th>
                    <th className="text-right">Lembretes gerados</th>
                    <th className="text-right">Ações</th>
                </tr>
                </thead>
                <tbody>
                {marcos.map((marco) => {
                    const totalGerados = marco._count?.marcos ?? 0;
                    const acaoEmAndamento = marcoEmAcao === marco.id;
                    return (
                        <tr key={marco.id}>
                            <td>
                                <span className="block font-semibold">{marco.nome}</span>
                                <span className="mt-0.5 block text-[12px] text-black/55">
                                    {marco.diasAposEntrega} {marco.diasAposEntrega === 1 ? "dia" : "dias"} após a entrega
                                </span>
                            </td>
                            <td>
                                <span className={marco.ativo ? "etiqueta etiqueta-escura" : "etiqueta"}>
                                    {marco.ativo ? "Ativo" : "Inativo"}
                                </span>
                            </td>
                            <td className="text-right tabular-nums">{totalGerados}</td>
                            <td>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="botao-link" onClick={() => aoEditar(marco)} disabled={acaoEmAndamento}>
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="botao-link"
                                        onClick={() => aoAlternarAtivo(marco)}
                                        disabled={acaoEmAndamento}
                                    >
                                        {marco.ativo ? "Desativar" : "Ativar"}
                                    </button>
                                    {/* com lembretes gerados o marco faz parte do histórico: só desativa */}
                                    {totalGerados === 0 && (
                                        <button
                                            type="button"
                                            className="botao-perigo"
                                            onClick={() => aoExcluir(marco)}
                                            disabled={acaoEmAndamento}
                                        >
                                            Excluir
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
