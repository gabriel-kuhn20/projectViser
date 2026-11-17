// Moldura das telas de autenticação (entrar, recuperar senha e redefinir senha):
// o lado da foto, o cartão do formulário e o link de voltar ficam aqui, num lugar só.
// Antes isso existia dentro do PaginaLogin e seria copiado a cada tela nova.
import { Link } from "react-router-dom";
import { LogoViser } from "../componentes_site/LogoViser";
import { FotoSite } from "../componentes_site/FotoSite";
import { IconeVoltar } from "./IconesMenu";

type PropriedadesMolduraAutenticacao = {
    titulo: string;
    subtitulo: string;
    aoEnviar: (evento: React.FormEvent) => void;
    destinoVoltar: string;
    textoVoltar: string;
    children: React.ReactNode;
};

export function MolduraAutenticacao({
    titulo,
    subtitulo,
    aoEnviar,
    destinoVoltar,
    textoVoltar,
    children,
}: PropriedadesMolduraAutenticacao) {
    return (
        <div className="login-shell">
            {/* lado da foto, igual ao topo do site */}
            <div className="relative hidden overflow-hidden bg-site-hero lg:block">
                <FotoSite chave="heroInicio" tom="escuro" prioritaria className="absolute inset-0 h-full w-full object-[70%_0%]" />
                <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 p-12 text-white">
                    <LogoViser className="h-[64px] w-auto text-[#e4e1da]" />
                    <p className="mt-6 text-[30px] leading-[1.1]">
                        Sua essência.
                        <br />
                        Seu estilo.
                    </p>
                </div>
            </div>

            <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
                <form onSubmit={aoEnviar} className="login-card">
                    <LogoViser className="mb-12 h-[44px] w-auto lg:hidden" />
                    <h1 className="login-titulo">{titulo}</h1>
                    <p className="pagina-subtitulo">{subtitulo}</p>
                    <span className="pagina-barra" aria-hidden="true" />

                    {children}

                    <Link to={destinoVoltar} className="link-voltar mt-8 mb-0 self-center">
                        <IconeVoltar className="h-4 w-4" />
                        {textoVoltar}
                    </Link>
                </form>
            </div>
        </div>
    );
}
