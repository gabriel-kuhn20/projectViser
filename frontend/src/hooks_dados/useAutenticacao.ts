import { useContext } from "react";
import { contextoAutenticacao } from "../contextos_autenticacao/ContextoAutenticacao";

// Exceção deliberada à regra "tudo em português": o prefixo "use" é mantido
// em inglês porque é assim que o próprio React reconhece um hook e aplica
// as regras dos hooks (eslint-plugin-react-hooks procura por ^use[A-Z]).
// O restante do nome segue português normalmente.
export function usarAutenticacao() {
  const contexto = useContext(contextoAutenticacao);
  if (!contexto) throw new Error("usarAutenticacao precisa estar dentro de ContextoAutenticacao");
  return contexto;
}
