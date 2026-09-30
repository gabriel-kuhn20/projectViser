import { useEffect, useState } from "react";
import { FormularioPessoa } from "../componentes_pessoas/FormularioPessoa";
import { TabelaPessoas } from "../componentes_pessoas/TabelaPessoas";
import { DadosPessoa, excluirPessoa, listarPessoas } from "../servicos_api/ApiPessoa";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

// CRUD de pessoas: cadastrar, listar, editar e excluir
export function PaginaPessoas() {
    const [pessoasCadastradas, definirPessoasCadastradas] = useState<DadosPessoa[]>([]);
    const [pessoaEmEdicao, definirPessoaEmEdicao] = useState<DadosPessoa | null>(null);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

    async function carregarPessoas() {
        try {
            definirPessoasCadastradas(await listarPessoas());
            definirMensagemErro(null);
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível carregar as pessoas"));
        }
    }

    useEffect(() => {
        carregarPessoas();
    }, []);

    async function excluirPessoaSelecionada(pessoa: DadosPessoa) {
        const confirmado = window.confirm(
            `Excluir "${pessoa.nome}"? Isso apaga também a conta de atendente, os clientes, entregas, lembretes e interações ligados a esta pessoa. Essa ação não pode ser desfeita.`
        );
        if (!confirmado) return;

        try {
            await excluirPessoa(pessoa.id);
            if (pessoaEmEdicao?.id === pessoa.id) definirPessoaEmEdicao(null);
            await carregarPessoas();
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível excluir a pessoa"));
        }
    }

    function finalizarEdicao() {
        definirPessoaEmEdicao(null);
        carregarPessoas();
    }

    return (
        <div>
            <h1 className="h3 mb-4">Pessoas</h1>
            <FormularioPessoa
                pessoaEmEdicao={pessoaEmEdicao}
                aoSalvar={finalizarEdicao}
                aoCancelar={() => definirPessoaEmEdicao(null)}
            />
            {mensagemErro && <div className="alert alert-danger" role="alert">{mensagemErro}</div>}
            <TabelaPessoas
                pessoasCadastradas={pessoasCadastradas}
                aoEditar={definirPessoaEmEdicao}
                aoExcluir={excluirPessoaSelecionada}
            />
        </div>
    );
}