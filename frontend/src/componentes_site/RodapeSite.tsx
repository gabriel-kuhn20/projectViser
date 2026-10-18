import { Link } from "react-router-dom";
import { LogoViser } from "./LogoViser";
import { IconeInstagram, IconeWhatsapp } from "./IconesSite";
import { contatoViser, horarios, linkAgendamento } from "./dadosSite";

export function RodapeSite() {
    return (
        <footer className="bg-black text-white font-montserrat">
            <div className="site-container pt-[120px] pb-[60px] lg:pr-[185px]">
                <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_311px] lg:gap-10">
                    <div>
                        <h2 className="text-[20px] font-bold mb-[26px]">Nossa localização</h2>

                        <div className="site-rodape-loja">
                            <p className="text-[16px] leading-[1.3]">
                                <strong className="font-bold">Centro</strong>
                                <br />
                                Rua Benjamin Constant, 1126, Sala
                                <br />
                                408 - Bairro centro, Lajeado/RS
                            </p>
                            <p className="site-rodape-loja-nota">
                                Showroom aberto
                                <br />
                                ao público.
                            </p>
                        </div>

                        <div className="site-rodape-loja mt-[38px]">
                            <p className="text-[16px] leading-[1.3]">
                                <strong className="font-bold">São Cristóvão:</strong>
                                <br />
                                Av. Piraí, 300 – Bairro São Cristovão
                                <br />
                                Lajeado/RS
                            </p>
                            <div className="site-rodape-loja-nota">
                                Somente com
                                <br />
                                horário agendado
                                <a href={linkAgendamento} target="_blank" rel="noreferrer" className="site-botao-agendamento">
                                    Faça seu agendamento
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-[20px] font-bold mb-[26px]">Horário de Funcionamento:</h2>
                        <ul className="grid grid-cols-3 gap-[7px] w-fit">
                            {horarios.map((dia) => (
                                <li key={dia.dia} className={`site-horario ${dia.claro ? "bg-site-claro" : "bg-site-escuro"}`}>
                                    <strong className="text-[15px] font-bold">{dia.dia}</strong>
                                    <span className="mt-2 text-[10.5px] leading-[1.25]">
                                        {dia.horario.map((linha) => (
                                            <span key={linha} className="block">
                                                {linha}
                                            </span>
                                        ))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-[56px] grid gap-12 lg:grid-cols-[minmax(0,1fr)_311px] lg:gap-10">
                    <div>
                        <LogoViser className="text-[62px] text-[#f1ebe3]" />
                        <p className="mt-3 text-[19px] leading-[1.35] max-w-[520px]">
                            Mais do que uma ótica, somos uma experiência de visagismo, identidade e sofisticação.
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-[14px]">
                            <a href={contatoViser.instagram} target="_blank" rel="noreferrer" aria-label="Instagram da Viser" className="site-rede-social">
                                <IconeInstagram className="h-[38px] w-[38px]" />
                            </a>
                            <a href={contatoViser.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp da Viser" className="site-rede-social">
                                <IconeWhatsapp className="h-[38px] w-[38px]" />
                            </a>
                        </div>
                        <p className="mt-[30px] text-[16px] leading-[1.35]">
                            Telefone fixo: <a href={`tel:+55${contatoViser.telefone.replace(/\D/g, "")}`}>{contatoViser.telefone}</a>
                            <br />
                            E-mail: <a href={`mailto:${contatoViser.email}`}>{contatoViser.email}</a>
                        </p>
                    </div>
                </div>

                <div className="mt-[90px] flex justify-end">
                    {/* acesso da equipe ao sistema de pós-venda */}
                    <Link to="/login" className="text-[12px] text-white/40 hover:text-white/80 transition-colors">
                        Área da equipe
                    </Link>
                </div>
            </div>
        </footer>
    );
}
