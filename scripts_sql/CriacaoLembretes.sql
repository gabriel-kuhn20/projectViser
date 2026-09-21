-- Depende de CriacaoPessoas.sql

CREATE TABLE entrega (
    entrega_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id   INT NOT NULL REFERENCES cliente (cliente_id),
    data_entrega DATE NOT NULL
);

CREATE INDEX idx_entrega_cliente ON entrega (cliente_id);

CREATE TABLE marco_acompanhamento (
    marco_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    entrega_id INT NOT NULL REFERENCES entrega (entrega_id),
    tipo       VARCHAR(20) NOT NULL CHECK (tipo IN ('7d', '2m', '1a')),
    data_alvo  DATE NOT NULL,
    UNIQUE (entrega_id, tipo) -- até 3 marcos por entrega, sem duplicar
);

CREATE TABLE lembrete (
    lembrete_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    marco_id     INT NOT NULL UNIQUE REFERENCES marco_acompanhamento (marco_id), -- 1:1, rotina agendada não duplica
    status       VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido')),
    criado_em    TIMESTAMP NOT NULL DEFAULT now(),
    concluido_em TIMESTAMP,
    CHECK ((status = 'concluido') = (concluido_em IS NOT NULL))
);

CREATE INDEX idx_lembrete_status ON lembrete (status);