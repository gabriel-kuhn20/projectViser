-- Depende de CriacaoPessoas.sql

CREATE TABLE entrega
(
    entrega_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id   INT       NOT NULL REFERENCES cliente (cliente_id),
    data_entrega DATE      NOT NULL,
    criado_em    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_entrega_cliente ON entrega (cliente_id);

CREATE TABLE tipo_marco
(
    tipo_marco_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          VARCHAR(20) NOT NULL UNIQUE CHECK (nome IN ('7d', '2m', '1a')),
    criado_em     TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE marco_acompanhamento
(
    marco_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    entrega_id    INT       NOT NULL REFERENCES entrega (entrega_id),
    tipo_marco_id INT       NOT NULL REFERENCES tipo_marco (tipo_marco_id),
    data_alvo     DATE      NOT NULL,
    criado_em     TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (entrega_id, tipo_marco_id) -- até 3 marcos por entrega, sem duplicar
);

CREATE INDEX idx_marco_entrega ON marco_acompanhamento (entrega_id);

CREATE TABLE lembrete
(
    lembrete_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    marco_id     INT         NOT NULL REFERENCES marco_acompanhamento (marco_id), -- 1:N, um marco pode gerar vários lembretes
    status       VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido')),
    criado_em    TIMESTAMP   NOT NULL DEFAULT now(),
    concluido_em TIMESTAMP,
    CHECK ((status = 'concluido') = (concluido_em IS NOT NULL))
);

CREATE INDEX idx_lembrete_marco ON lembrete (marco_id);
CREATE INDEX idx_lembrete_status ON lembrete (status);