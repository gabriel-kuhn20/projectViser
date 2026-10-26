import { useEffect, useState } from "react";
import { CampoTexto } from "../componentes_compartilhados/CampoTexto";
import { BotaoPrimario } from "../componentes_compartilhados/BotaoPrimario";
import { cadastrarTipoMarco, editarTipoMarco, type TipoMarcoApi } from "../servicos_api/ApiTipoMarco";
import { formatarMensagemErro } from "../utilitarios_formatacao/FormatarErro";

type PropriedadesFormularioMarco = {
    marcoEmEdicao: TipoMarcoApi | null;
    aoSalvar: (marcoSalvo: TipoMarcoApi, estavaEditando: boolean) => void;
    aoCancelarEdicao: () => void;
};

const camposIniciais = { nome: "", diasAposEntrega: "" };

// UC04 · Calcular marcos de acompanhamento (RF03): o administrador define os prazos de contato
export function FormularioMarco({ marcoEmEdicao, aoSalvar, aoCancelarEdicao }: PropriedadesFormularioMarco) {
    const [campos, definirCampos] = useState(camposIniciais);
    const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
    const [estaEnviando, definirEstaEnviando] = useState(false);

    const estaEditando = marcoEmEdicao !== null;
    // mesma regra do servidor: depois de gerar lembretes os dias ficam travados, só o nome muda
    const diasTravados = (marcoEmEdicao?._count?.marcos ?? 0) > 0;

    useEffect(() => {
        definirMensagemErro(null);
        if (!marcoEmEdicao) {
            definirCampos(camposIniciais);
            return;
        }
        definirCampos({ nome: marcoEmEdicao.nome, diasAposEntrega: String(marcoEmEdicao.diasAposEntrega) });
    }, [marcoEmEdicao]);

    async function enviarFormulario(evento: React.FormEvent) {
        evento.preventDefault();
        definirMensagemErro(null);
        definirEstaEnviando(true);

        const dadosMarco = { nome: campos.nome, diasAposEntrega: Number(campos.diasAposEntrega) };
        try {
            if (marcoEmEdicao) {
                const dadosEdicao = diasTravados ? { nome: dadosMarco.nome } : dadosMarco;
                aoSalvar(await editarTipoMarco(marcoEmEdicao.id, dadosEdicao), true);
                return;
            }
            aoSalvar(await cadastrarTipoMarco(dadosMarco), false);
            definirCampos(camposIniciais);
        } catch (erro) {
            definirMensagemErro(formatarMensagemErro(erro, "não foi possível salvar o marco. tente novamente."));
        } finally {
            definirEstaEnviando(false);
        }
    }

    function escolherTextoBotao() {
        if (estaEnviando) return "Salvando...";
        if (estaEditando) return "Salvar alterações";
        return "Cadastrar marco";
    }

    return (
        <form onSubmit={enviarFormulario} className="cartao flex flex-col gap-5">
            <h3 className="secao-titulo">{estaEditando ? "Editar marco" : "Novo marco"}</h3>

            {mensagemErro && <p role="alert" className="mensagem-erro">{mensagemErro}</p>}

            <CampoTexto
                rotulo="Nome"
                valor={campos.nome}
                aoAlterar={(valorDigitado) => definirCampos((atuais) => ({ ...atuais, nome: valorDigitado }))}
                placeholder="ex: 15 dias"
                obrigatorio
            />

            <label className="campo-texto-rotulo">
                Dias após a entrega
                <input
                    type="number"
                    min={1}
                    max={3650}
                    step={1}
                    value={campos.diasAposEntrega}
                    required
                    disabled={diasTravados}
                    onChange={(evento) => definirCampos((atuais) => ({ ...atuais, diasAposEntrega: evento.target.value }))}
                    className="campo-texto-input disabled:bg-black/5 disabled:text-black/50"
                />
            </label>
            {diasTravados && (
                <p className="-mt-3 text-[13px] text-black/55">
                    Esse marco já gerou lembretes, então os dias não mudam. Para outro prazo, desative-o e crie um novo.
                </p>
            )}

            <div className="formulario-acoes">
                <BotaoPrimario texto={escolherTextoBotao()} desabilitado={estaEnviando} />
                {estaEditando && (
                    <button type="button" className="botao-secundario" onClick={aoCancelarEdicao} disabled={estaEnviando}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}
