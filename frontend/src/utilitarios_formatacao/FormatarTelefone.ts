// telefone brasileiro com DDD: fixo (51) 3333-4444 ou celular (51) 99999-4444

const TOTAL_DIGITOS_CELULAR = 11;
const TOTAL_DIGITOS_FIXO = 10;

function extrairDigitosTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

// o +55 colado do WhatsApp não faz parte do número que a loja usa no dia a dia
function removerCodigoPais(digitosTelefone: string): string {
  const temCodigoPais = /^55\d{10,11}$/.test(digitosTelefone);
  if (!temCodigoPais) return digitosTelefone;
  return digitosTelefone.slice(2);
}

// máscara aplicada enquanto a atendente digita: vai montando "(51) 99999-4444" a cada número
export function aplicarMascaraTelefone(valorDigitado: string): string {
  const digitosTelefone = removerCodigoPais(extrairDigitosTelefone(valorDigitado)).slice(0, TOTAL_DIGITOS_CELULAR);

  if (digitosTelefone.length === 0) return "";
  if (digitosTelefone.length <= 2) return digitosTelefone.replace(/^(\d{1,2})$/, "($1");
  if (digitosTelefone.length <= 6) return digitosTelefone.replace(/^(\d{2})(\d{1,4})$/, "($1) $2");
  if (digitosTelefone.length <= TOTAL_DIGITOS_FIXO) {
    return digitosTelefone.replace(/^(\d{2})(\d{4})(\d{1,4})$/, "($1) $2-$3");
  }
  return digitosTelefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}

// exibição nas listas: contatos gravados só com números (ou de antes da máscara) saem formatados;
// o que não for um telefone completo aparece como foi digitado
export function formatarTelefone(contato: string): string {
  const digitosTelefone = removerCodigoPais(extrairDigitosTelefone(contato));
  const ehTelefoneCompleto =
      digitosTelefone.length === TOTAL_DIGITOS_FIXO || digitosTelefone.length === TOTAL_DIGITOS_CELULAR;
  if (!ehTelefoneCompleto) return contato;
  return aplicarMascaraTelefone(digitosTelefone);
}
