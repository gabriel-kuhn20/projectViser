-- Depende de CriacaoPessoas.sql e CriacaoLembretes.sql

CREATE TABLE interacao
(
    interacao_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lembrete_id      INT       NOT NULL REFERENCES lembrete (lembrete_id),
    atendente_id     INT       NOT NULL REFERENCES atendente (atendente_id),
    conteudo         TEXT      NOT NULL,
    resposta_cliente TEXT,
    criado_em        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_interacao_lembrete ON interacao (lembrete_id);

CREATE TABLE em_atendimento
(
    em_atendimento_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lembrete_id       INT       NOT NULL UNIQUE REFERENCES lembrete (lembrete_id), -- só 1 atendente por lembrete (RF08)
    atendente_id      INT       NOT NULL REFERENCES atendente (atendente_id),
    iniciado_em       TIMESTAMP NOT NULL DEFAULT now()
);