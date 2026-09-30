import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { DadosTag } from "../servicos_api/ApiTag";
import { formatarDataBr } from "../utilitarios_formatacao/FormatarData";

type PropriedadesTabelaTags = {
    tagsCadastradas: DadosTag[];
    aoEditar: (tag: DadosTag) => void;
    aoExcluir: (tag: DadosTag) => void;
};

// Listar tags
export function TabelaTags({ tagsCadastradas, aoEditar, aoExcluir }: PropriedadesTabelaTags) {
    if (tagsCadastradas.length === 0) {
        return <p className="text-muted">nenhuma tag cadastrada</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped align-middle">
                <thead>
                <tr>
                    <th>Nome</th>
                    <th>Criada em</th>
                    <th className="text-end">Ações</th>
                </tr>
                </thead>
                <tbody>
                {tagsCadastradas.map((tag) => (
                    <tr key={tag.id}>
                        <td>{tag.nome}</td>
                        <td>{formatarDataBr(tag.criadoEm)}</td>
                        <td className="text-end">
                            <div className="d-inline-flex gap-2">
                                <BotaoPrimario texto="Editar" variante="outline-primary" aoClicar={() => aoEditar(tag)} />
                                <BotaoPrimario texto="Excluir" variante="outline-danger" aoClicar={() => aoExcluir(tag)} />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}