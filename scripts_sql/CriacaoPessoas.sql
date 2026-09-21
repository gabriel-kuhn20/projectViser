-- Executar antes de CriacaoLembretes.sql

CREATE TABLE atendente (
    atendente_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome         VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    senha        VARCHAR(255) NOT NULL, -- hash (RNF02), nunca texto puro
    criado_em    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE cliente (
    cliente_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome         VARCHAR(150) NOT NULL,
    contato      VARCHAR(100) NOT NULL,
    atendente_id INT NOT NULL REFERENCES atendente (atendente_id), -- responsável pela venda
    criado_em    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_cliente_atendente ON cliente (atendente_id);