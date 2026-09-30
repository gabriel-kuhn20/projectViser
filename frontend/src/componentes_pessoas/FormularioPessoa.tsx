import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { cadastrarPessoa, editarPessoa, DadosEnvioPessoa, DadosPessoa } from "../servicos_api/ApiPessoa";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioPessoa = {
    pessoaEmEdicao: DadosPessoa | null;
    aoSalvar: () => void;
    aoCancelar: () => void;
};

// Cadastrar pessoa / Editar pessoa
export function FormularioPessoa({ pessoaEmEdicao, aoSalvar, aoCancelar }: PropriedadesFormularioPessoa) {
    const [nomePessoa, definirNomePessoa] = useState("");
    const [emailPessoa, definirEmailPessoa] = useState("");
    const [cpfPessoa, definirCpfPessoa] = useState("");
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    useEffect(() => {
        definirNomePessoa(pessoaEmEdicao?.nome ?? "");
        definirEmailPessoa(pessoaEmEdicao?.email ?? "");
        definirCpfPessoa(pessoaEmEdicao?.cpf ?? "");
        definirMensagemErro(null);
    }, [pessoaEmEdicao]);

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirEstaEnviando(true);

        const dadosEnvio: DadosEnvioPessoa = { nome: nomePessoa };
        if (emailPessoa.trim()) dadosEnvio.email = emailPessoa.trim();
        if (cpfPessoa.trim()) dadosEnvio.cpf = cpfPessoa.trim();

        try {
            if (pessoaEmEdicao) {
                await editarPessoa(pessoaEmEdicao.id, dadosEnvio);
            } else {
                await cadastrarPessoa(dadosEnvio);
            }
            definirNomePessoa("");
            definirEmailPessoa("");
            definirCpfPessoa("");
            aoSalvar();
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível salvar a pessoa"));
        } finally {
            definirEstaEnviando(false);
        }
    }

    return (
        <form onSubmit={enviarFormulario} className="card card-body mb-4" style={{ maxWidth: 480 }}>
            <h2 className="h5 mb-3">{pessoaEmEdicao ? "Editar pessoa" : "Nova pessoa"}</h2>
            <CampoTexto rotulo="Nome" valor={nomePessoa} aoAlterar={definirNomePessoa} obrigatorio />
            <CampoTexto rotulo="Email (opcional)" tipo="email" valor={emailPessoa} aoAlterar={definirEmailPessoa} />
            <CampoTexto rotulo="CPF (opcional)" valor={cpfPessoa} aoAlterar={definirCpfPessoa} />
            {mensagemErro && <div className="alert alert-danger" role="alert">{mensagemErro}</div>}
            <div className="d-flex gap-2">
                <BotaoPrimario
                    tipo="submit"
                    texto={estaEnviando ? "Salvando..." : pessoaEmEdicao ? "Salvar alterações" : "Cadastrar"}
                    desabilitado={estaEnviando}
                />
                {pessoaEmEdicao && <BotaoPrimario texto="Cancelar" variante="secondary" aoClicar={aoCancelar} />}
            </div>
        </form>
    );
}