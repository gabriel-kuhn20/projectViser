// busca feita na própria tela: as listas já chegam completas da API

// minúsculas e sem acento, para "joao" achar "João"
function normalizarTexto(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function extrairDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

// termo só com número e pontuação de telefone ("(51) 9999") compara só os dígitos,
// senão "51 9999" não acharia o contato salvo como "51999990000"
function ehBuscaNumerica(termoBusca: string): boolean {
  return /^[\d\s()+.-]+$/.test(termoBusca) && extrairDigitos(termoBusca).length > 0;
}

// verdadeiro se algum dos campos contém o termo; termo vazio não filtra nada
export function correspondeBusca(termoBusca: string, camposBusca: (string | null | undefined)[]): boolean {
  const termoNormalizado = normalizarTexto(termoBusca);
  if (termoNormalizado === "") return true;

  const camposPreenchidos = camposBusca.filter((campoBusca): campoBusca is string => Boolean(campoBusca));

  if (ehBuscaNumerica(termoNormalizado)) {
    const digitosBusca = extrairDigitos(termoNormalizado);
    return camposPreenchidos.some((campoBusca) => extrairDigitos(campoBusca).includes(digitosBusca));
  }

  return camposPreenchidos.some((campoBusca) => normalizarTexto(campoBusca).includes(termoNormalizado));
}
