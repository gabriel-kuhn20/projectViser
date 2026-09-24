-- Executar antes de CriacaoLembretes.sql

CREATE TABLE pessoa
(
    pessoa_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome      VARCHAR(150) NOT NULL,
    email     VARCHAR(150),
    cpf       CHAR(11),
    criado_em TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE usuario
(
    usuario_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pessoa_id  INT          NOT NULL REFERENCES pessoa (pessoa_id), -- vínculo 1:1 com os dados pessoais
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha      VARCHAR(255) NOT NULL,                               -- hash (RNF02), nunca texto puro
    criado_em  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_usuario_pessoa ON usuario (pessoa_id);

CREATE TABLE cliente
(
    cliente_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pessoa_id      INT          NOT NULL REFERENCES pessoa (pessoa_id),
    contato        VARCHAR(100) NOT NULL,
    endereco       VARCHAR(255),
    responsavel_id INT REFERENCES usuario (usuario_id), -- atendente responsável pela venda
    criado_em      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_cliente_pessoa ON cliente (pessoa_id);
CREATE INDEX idx_cliente_responsavel ON cliente (responsavel_id);

CREATE TABLE tag
(
    tag_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE cliente_tag
(
    cliente_id   INT       NOT NULL REFERENCES cliente (cliente_id),
    tag_id       INT       NOT NULL REFERENCES tag (tag_id),
    vinculado_em TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (cliente_id, tag_id)
);

CREATE INDEX idx_cliente_tag_tag ON cliente_tag (tag_id);