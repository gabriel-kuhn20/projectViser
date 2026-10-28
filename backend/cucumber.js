// Configuração dos testes BDD (npm run test:bdd).
// Os passos são em TypeScript: o ts-node traduz na hora, sem precisar do build.
module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    requireModule: ["ts-node/register/transpile-only"],
    require: ["features/suporte/**/*.ts", "features/passos/**/*.ts"],
    format: ["progress-bar"],
  },
};
