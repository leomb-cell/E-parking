DROP DATABASE IF EXISTS e_parking;

CREATE DATABASE e_parking;

create table usuarios (
    id_usuario serial primary key,
    nome varchar(100),
    cpf_cnpj varchar(14) unique not null,
    dt_nascimento date not null,
    num_telefone varchar(50) not null
);

create table login_usuarios (
    id_login serial primary key,
    id_usuario int UNIQUE not null,
    email VARCHAR(255) unique not null,
    senha_hash VARCHAR(60) not null,
    jwt_token VARCHAR(500),
    validade_token TIMESTAMPtZ,
    Foreign Key (id_usuario) REFERENCES usuarios (id_usuario)
);

create table motoristas (
    id_motorista serial primary key,
    id_usuario int not null,
    dt_registro timestamptz default now(),
    Foreign Key (id_usuario) references usuarios (id_usuario)
);

create table proprietarios (
    id_proprietario serial primary key,
    id_usuario int not null,
    dt_registro timestamptz not null default now(),
    Foreign Key (id_usuario) REFERENCES usuarios (id_usuario)
);

create table resumo_financeiro (
    id_proprietario int NOT NULL,
    dt_movimento date NOT NULL,
    total_dia numeric(12, 2) NOT NULL,
    qtd_reservas int NOT NULL,
    gerado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id_proprietario, dt_movimento),
    FOREIGN KEY (id_proprietario) REFERENCES proprietarios (id_proprietario)
);

create table cargos (
    id_cargo serial primary key,
    nome_cargo varchar(100) not null
);

insert into
    cargos (nome_cargo)
values ('master_plataforma'),
    ('adm_plataforma'),
    ('operador_plataforma'),
    ('operador_estacionamento'),
    ('gerente_estacionamento');

create Table administradores_plataforma (
    id_adm serial primary key,
    id_usuario int not null,
    id_cargo int not null,
    dt_registro timestamptz default now(),
    Foreign Key (id_usuario) REFERENCES usuarios (id_usuario),
    Foreign Key (id_cargo) REFERENCES cargos (id_cargo)
);

create table estados (
    id_estado serial primary key,
    nome varchar(30) not null,
    uf char(2) unique not null,
    codigo_ibge int unique not null
);

create table municipios (
    id_municipio serial primary key,
    id_estado int not null,
    nome varchar(60) not null,
    codigo_ibge int unique not null,
    Foreign Key (id_estado) REFERENCES estados (id_estado)
);

create table enderecos (
    id_endereco serial primary key,
    id_municipio int not null,
    logradouro VARCHAR(150) not null,
    numero varchar(10),
    complemento varchar(50),
    bairro varchar(70) not null,
    cep char(8) not NULL,
    longitude decimal(11, 8) not null,
    latitude decimal(10, 8) not null,
    Foreign Key (id_municipio) REFERENCES municipios (id_municipio)
);

create table estacionamentos (
    id_estacionamento serial primary key,
    id_proprietario int not null,
    id_endereco int not null,
    qtd_vagas_idoso int not null default (0),
    qtd_vagas_pcd int not null default (0),
    qtd_vagas_comum int not null default (0),
    lotacao_atual int not null default (0) check (lotacao_atual >= 0),
    nome varchar(255) not null,
    hr_abertura time not null,
    hr_fechamento time not null,
    num_alvara varchar(50) not null,
    validade_alvara DATE not null,
    Foreign Key (id_proprietario) REFERENCES proprietarios (id_proprietario),
    Foreign Key (id_endereco) REFERENCES enderecos (id_endereco)
);

create table operadores_estacionamento (
    id_operador serial primary key,
    id_usuario int not null,
    id_proprietario int not null,
    id_cargo int not null,
    dt_registro timestamptz default now(),
    Foreign Key (id_usuario) REFERENCES usuarios (id_usuario),
    Foreign Key (id_proprietario) REFERENCES proprietarios (id_proprietario),
    Foreign Key (id_cargo) REFERENCES cargos (id_cargo)
);

-- tipo de veiculo

-- confirmados: van, moto, carro, camionete

create table tipos_veiculos (
    id_tipo serial primary key,
    tipo VARCHAR(30)
);

insert into
    tipos_veiculos (tipo)
values ('van'),
    ('moto'),
    ('carro'),
    ('camionete');

-- Veiculos

create table veiculos (
    id_veiculo serial primary key,
    id_dono int not null,
    id_tipo int not null,
    modelo varchar(50),
    placa varchar(10) unique not null,
    cor varchar(16),
    dt_registro timestamptz default now(),
    Foreign Key (id_dono) REFERENCES motoristas (id_motorista),
    Foreign Key (id_tipo) REFERENCES tipos_veiculos (id_tipo)
);

-- Motoristas autorizados

create table motoristas_autorizados (
    id_motorista int not null,
    id_veiculo int not null,
    dt_autorizacao timestamptz default now(),
    dt_revogacao timestamptz,
    primary key (id_motorista, id_veiculo),
    Foreign Key (id_motorista) REFERENCES motoristas (id_motorista),
    Foreign Key (id_veiculo) REFERENCES veiculos (id_veiculo)
);

-- Status da reserva

create table status_reserva (
    id_status serial primary key,
    status_nome varchar(50) not null
);

insert into
    status_reserva (status_nome)
values ('confirmada'),
    ('cancelada'),
    ('atrasada'),
    ('concluida');

-- Reservas

create table reservas (
    id_reserva serial primary key,
    id_motorista int not null,
    id_estacionamento int not null,
    id_veiculo int not null,
    id_status int not null,
    dt_inicio_previsto timestamptz not null,
    dt_fim_previsto timestamptz not null check (
        dt_fim_previsto > dt_inicio_previsto
    ),
    dt_inicio_real timestamptz,
    dt_fim_real timestamptz,
    valor decimal(10, 2) not NULL check (valor >= 0),
    codigo_voucher char(4),
    Foreign Key (id_motorista) REFERENCES motoristas (id_motorista),
    Foreign Key (id_estacionamento) REFERENCES estacionamentos (id_estacionamento),
    Foreign Key (id_status) REFERENCES status_reserva (id_status),
    Foreign Key (id_veiculo) REFERENCES veiculos (id_veiculo)
);

-- Status de uma transação

create Table status_transacao (
    id_tr_status serial PRIMARY KEY,
    tr_status_nome varchar(50)
);

insert into
    status_transacao (tr_status_nome)
values ('pendente'),
    ('aprovada'),
    ('recusada'),
    ('cancelada'),
    ('expirada'),
    ('estornada');

-- transaçoes de uma reserva

create table transacoes (
    id_transacao serial primary key,
    id_reserva int not null,
    valor decimal(10, 2) not null check (valor >= 0),
    dt_transacao timestamptz not null default now(),
    id_tr_status int not null,
    metodo_pagamento varchar(100) not null,
    Foreign Key (id_reserva) REFERENCES reservas (id_reserva),
    Foreign Key (id_tr_status) REFERENCES status_transacao (id_tr_status)
);

-- tarifas de um estacionamento

create table tarifas (
    id_tarifa serial primary key,
    id_estacionamento int not null,
    id_tipo int not null,
    vlr_hora decimal(10, 2) not null check (vlr_hora >= 0),
    tolerancia_min int not null default 0 check (tolerancia_min >= 0),
    multa_excedente decimal(10, 2) not null check (multa_excedente >= 0),
    vigente_de date not null default current_date,
    vigente_ate date,
    Foreign Key (id_estacionamento) REFERENCES estacionamentos (id_estacionamento),
    Foreign Key (id_tipo) REFERENCES tipos_veiculos (id_tipo)
);

-- Indices

CREATE INDEX index_R_fim_real ON reservas (
    (
        (
            dt_fim_real at time zone 'America/Sao_Paulo'
        )::date
    )
);

CREATE INDEX index_R_estacionamento ON reservas (id_estacionamento);

CREATE INDEX index_E_proprietario ON estacionamentos (id_proprietario);

CREATE INDEX index_E_endereco ON estacionamentos (id_endereco);

CREATE INDEX index_V_dono ON veiculos (id_dono);

CREATE INDEX index_V_tipo ON veiculos (id_tipo);

CREATE INDEX index_M_usuario ON motoristas (id_usuario);

CREATE INDEX index_P_usuario ON proprietarios (id_usuario);

CREATE INDEX index_R_motorista ON reservas (id_motorista);

CREATE INDEX index_R_status ON reservas (id_status);

CREATE INDEX index_T_reserva ON transacoes (id_reserva);

create index index_TAR_ewstacionamento on tarifas (id_estacionamento);

CREATE INDEX index_R_estac_inicio ON reservas (
    id_estacionamento,
    dt_inicio_previsto
);

CREATE UNIQUE INDEX index_L_email ON login_usuarios (email);

-- Stored Procedures

CREATE PROCEDURE gerar_resumo_financeiro(
	p_dt_movimento date default current_date
)
LANGUAGE plpgsql
AS $$
BEGIN

	with totais as (
		select
			e.id_proprietario,
			date(r.dt_fim_real) as dt_fim_reserva,
			sum(r.valor) as total_dia,
			count(*) as total_reservas
		from reservas r
		inner join estacionamentos e on r.id_estacionamento = e.id_estacionamento
		where date(r.dt_fim_real) = p_dt_movimento
		group by e.id_proprietario, dt_fim_reserva
	)
	insert into resumo_financeiro (id_proprietario, dt_movimento, total_dia, qtd_reservas)
	select id_proprietario, p_dt_movimento, total_dia, total_reservas
    from totais
    ON CONFLICT (id_proprietario, dt_movimento)
    DO UPDATE SET total_dia    = EXCLUDED.total_dia,
                  qtd_reservas = EXCLUDED.qtd_reservas,
                  gerado_em    = now();

END;
$$;