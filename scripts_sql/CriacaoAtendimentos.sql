-- Depende de CriacaoPessoas.sql e CriacaoLembretes.sql

CREATE TABLE interacao
(
    interacao_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lembrete_id      INT       NOT NULL REFERENCES lembrete (lembrete_id),
    usuario_id       INT       NOT NULL REFERENCES usuario (usuario_id),
    conteudo         TEXT      NOT NULL,
    resposta_cliente TEXT,
    criado_em        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_interacao_lembrete ON interacao (lembrete_id);
CREATE INDEX idx_interacao_usuario ON interacao (usuario_id);

CREATE TABLE em_atendimento
(
    em_atendimento_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lembrete_id       INT       NOT NULL REFERENCES lembrete (lembrete_id), -- N:N: um lembrete pode ter mais de um atendimento ao longo do tempo
    usuario_id        INT       NOT NULL REFERENCES usuario (usuario_id),
    iniciado_em       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_em_atendimento_lembrete ON em_atendimento (lembrete_id);
CREATE INDEX idx_em_atendimento_usuario ON em_atendimento (usuario_id);