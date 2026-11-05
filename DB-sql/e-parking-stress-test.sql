-- ============================================================================
-- STRESS TEST e_parking  -  ARQUIVO UNICO, COMPATIVEL COM DBEAVER
-- ----------------------------------------------------------------------------
-- COMO USAR (DBeaver)
--   1. Abra este arquivo em um editor SQL ligado ao banco e_parking
--      (confira no primeiro SELECT abaixo; nao use \c, DBeaver nao entende).
--   2. Ligue o Auto-commit (menu Database > Transaction Mode > Auto-Commit).
--   3. Execute o SCRIPT INTEIRO com Alt+X (nao Ctrl+Enter).
--   4. Veja o resultado na secao 9 (ou: select * from bench_resultados order by id).
--
-- DICAS
--   * Alt+X abre uma aba de resultado por SELECT. Se incomodar, execute so as
--     secoes 1 a 7 e rode a secao 9 depois, com Ctrl+Enter em cada consulta.
--   * Nenhum comando aqui tem linha em branco DENTRO de um statement, entao o
--     DBeaver nao quebra os blocos DO / PROCEDURE ao meio.
--   * Este script INSERE MILHOES de linhas. Use banco de teste, nunca producao.
--   * Se alguma tabela de dados ja tiver linhas, a carga (secao 2) e ignorada e
--     os testes rodam sobre os dados existentes (com IDs reais, mesmo que nao
--     sejam sequenciais).
--   * Comece pequeno: troque 2000000 por 200000 na secao 1 e suba depois.
--   * Rodar de novo apaga bench_resultados/bench_params (historico anterior).
--
-- CONCORRENCIA (sem pgbench)
--   A secao 8 tem blocos de carga em loop. Para simular varios usuarios, abra
--   varios editores SQL (cada um com sua conexao) e execute o bloco da secao 8
--   ao mesmo tempo. Compare o tempo medio com o de uma execucao isolada.
-- ============================================================================

select current_database() as banco, current_schema() as schema;

-- ============================================================================
-- 1. CONFIGURACAO E INFRAESTRUTURA DO BENCHMARK
-- ============================================================================

drop table if exists bench_config;

create table bench_config (
    qtd_usuarios        int not null,
    qtd_motoristas      int not null,
    qtd_proprietarios   int not null,
    qtd_estacionamentos int not null,
    qtd_veiculos        int not null,
    qtd_reservas        int not null
);

-- qtd_usuarios deve ser >= motoristas + proprietarios + 5100
insert into bench_config values (200000, 150000, 2000, 5000, 250000, 2000000);

drop table if exists bench_resultados;

create table bench_resultados (
    id             serial primary key,
    executado_em   timestamptz default now(),
    grupo          varchar(30),
    teste          varchar(120),
    repeticoes     int,
    tempo_total_ms numeric(14,2),
    tempo_medio_ms numeric(14,3),
    tempo_min_ms   numeric(14,3),
    tempo_max_ms   numeric(14,3),
    linhas         bigint,
    erro           text
);

-- IDs/valores REAIS usados pelos testes (preenchida na secao 3)
drop table if exists bench_params;

create table bench_params (
    chave varchar(30) primary key,
    valor text
);

-- Tabelas de dados com chave serial (usadas para checar vazio e zerar sequences)
drop table if exists bench_tabelas;

create table bench_tabelas (tab text, col text);

insert into bench_tabelas values
    ('usuarios', 'id_usuario'),
    ('login_usuarios', 'id_login'),
    ('motoristas', 'id_motorista'),
    ('proprietarios', 'id_proprietario'),
    ('administradores_plataforma', 'id_adm'),
    ('estados', 'id_estado'),
    ('municipios', 'id_municipio'),
    ('enderecos', 'id_endereco'),
    ('estacionamentos', 'id_estacionamento'),
    ('operadores_estacionamento', 'id_operador'),
    ('veiculos', 'id_veiculo'),
    ('reservas', 'id_reserva'),
    ('transacoes', 'id_transacao'),
    ('tarifas', 'id_tarifa');

-- Registra o tempo de uma etapa da carga
create or replace function bench_log(p_teste text, p_t0 timestamptz, p_linhas bigint)
returns void
language plpgsql
as $$
declare
    ms numeric := extract(epoch from (clock_timestamp() - p_t0)) * 1000;
begin
    insert into bench_resultados
        (grupo, teste, repeticoes, tempo_total_ms, tempo_medio_ms, tempo_min_ms, tempo_max_ms, linhas)
    values
        ('carga', p_teste, 1, round(ms, 2), round(ms, 3), round(ms, 3), round(ms, 3), p_linhas);
end;
$$;

-- Troca {chave} pelos valores reais de bench_params dentro de um SQL
create or replace function bench_sub(p_sql text)
returns text
language plpgsql
stable
as $$
declare
    r record;
    s text := p_sql;
begin
    for r in select chave, valor from bench_params loop
        s := replace(s, '{' || r.chave || '}', replace(r.valor, '''', ''''''));
    end loop;
    return s;
end;
$$;

-- Plano de execucao (EXPLAIN ANALYZE) de um SQL com placeholders
create or replace function bench_explain(p_sql text)
returns setof text
language plpgsql
as $$
begin
    return query execute 'explain (analyze, buffers) ' || bench_sub(p_sql);
end;
$$;

-- Executa um SQL N vezes e grava min / medio / max em bench_resultados.
-- Se der erro, grava a mensagem na coluna "erro" e o script continua.
-- A 1a repeticao costuma ser "fria" (cache vazio): aparece em tempo_max_ms.
create or replace procedure bench(p_grupo text, p_teste text, p_sql text, p_reps int default 5)
language plpgsql
as $$
declare
    i      int;
    t0     timestamptz;
    ms     numeric;
    soma   numeric := 0;
    mn     numeric;
    mx     numeric;
    n      bigint := 0;
    v_sql  text := bench_sub(p_sql);
    v_erro text;
begin
    for i in 1..p_reps loop
        begin
            t0 := clock_timestamp();
            execute v_sql;
            get diagnostics n = row_count;
            ms := extract(epoch from (clock_timestamp() - t0)) * 1000;
            soma := soma + ms;
            mn := least(coalesce(mn, ms), ms);
            mx := greatest(coalesce(mx, ms), ms);
        exception when others then
            v_erro := sqlerrm;
            exit;
        end;
    end loop;
    if v_erro is null then
        insert into bench_resultados
            (grupo, teste, repeticoes, tempo_total_ms, tempo_medio_ms, tempo_min_ms, tempo_max_ms, linhas)
        values
            (p_grupo, p_teste, p_reps, round(soma, 2), round(soma / p_reps, 3), round(mn, 3), round(mx, 3), n);
    else
        insert into bench_resultados (grupo, teste, repeticoes, linhas, erro)
        values (p_grupo, p_teste, p_reps, 0, v_erro);
    end if;
end;
$$;

-- ============================================================================
-- 2. CARGA DE DADOS (tempo de cada etapa fica registrado no grupo 'carga')
--    So roda se TODAS as tabelas de dados estiverem vazias.
-- ============================================================================

do $seed$
declare
    cfg        bench_config%rowtype;
    r          record;
    t0         timestamptz;
    n          bigint;
    v_tem      boolean;
    v_estados  int[];
    v_tipos    int[];
    s_conf     int;
    s_canc     int;
    s_atras    int;
    s_concl    int;
    p_recus    int;
    p_aprov    int;
    p_canc     int;
begin
    -- 1) so carrega se tudo estiver vazio
    for r in select tab, col from bench_tabelas loop
        execute format('select exists (select 1 from %I)', r.tab) into v_tem;
        if v_tem then
            raise notice 'Tabela % ja tem dados: carga ignorada. Os testes rodarao sobre os dados atuais.', r.tab;
            return;
        end if;
    end loop;
    -- 2) tudo vazio: zera as sequences para os IDs comecarem em 1
    for r in select tab, col from bench_tabelas loop
        execute format('alter sequence %s restart', pg_get_serial_sequence(format('%I', r.tab), r.col));
    end loop;
    -- 3) IDs das tabelas de dominio
    select id_status into s_conf  from status_reserva where status_nome = 'confirmada';
    select id_status into s_canc  from status_reserva where status_nome = 'cancelada';
    select id_status into s_atras from status_reserva where status_nome = 'atrasada';
    select id_status into s_concl from status_reserva where status_nome = 'concluida';
    select id_tr_status into p_recus from status_transacao where tr_status_nome = 'recusada';
    select id_tr_status into p_aprov from status_transacao where tr_status_nome = 'aprovada';
    select id_tr_status into p_canc  from status_transacao where tr_status_nome = 'cancelada';
    select array_agg(id_tipo order by id_tipo) into v_tipos from tipos_veiculos;
    select * into cfg from bench_config;
    perform setseed(0.42);
    -- estados
    t0 := clock_timestamp();
    insert into estados (nome, uf, codigo_ibge) values
        ('Rio Grande do Sul', 'RS', 43),
        ('Santa Catarina',    'SC', 42),
        ('Parana',            'PR', 41),
        ('Sao Paulo',         'SP', 35),
        ('Minas Gerais',      'MG', 31);
    get diagnostics n = row_count;
    perform bench_log('estados', t0, n);
    select array_agg(id_estado order by id_estado) into v_estados from estados;
    -- municipios (500)
    t0 := clock_timestamp();
    insert into municipios (id_estado, nome, codigo_ibge)
    select v_estados[1 + (g % 5)], 'Municipio ' || g, 1000000 + g
    from generate_series(1, 500) g;
    get diagnostics n = row_count;
    perform bench_log('municipios', t0, n);
    -- enderecos (1 por estacionamento)
    t0 := clock_timestamp();
    insert into enderecos (id_municipio, logradouro, numero, complemento, bairro, cep, longitude, latitude)
    select 1 + (g % 500),
           'Rua ' || g,
           ((g % 3000) + 1)::text,
           null,
           'Bairro ' || (g % 200),
           lpad((90000000 + g)::text, 8, '0'),
           round((-53 + random() * 5)::numeric, 8),
           round((-30 + random() * 3)::numeric, 8)
    from generate_series(1, cfg.qtd_estacionamentos) g;
    get diagnostics n = row_count;
    perform bench_log('enderecos', t0, n);
    -- usuarios
    t0 := clock_timestamp();
    insert into usuarios (nome, cpf_cnpj, dt_nascimento, num_telefone)
    select 'Usuario ' || g,
           lpad(g::text, 11, '0'),
           date '1950-01-01' + floor(random() * 20000)::int,
           '5554' || lpad((900000000 + g)::text, 9, '0')
    from generate_series(1, cfg.qtd_usuarios) g;
    get diagnostics n = row_count;
    perform bench_log('usuarios', t0, n);
    -- login_usuarios
    t0 := clock_timestamp();
    insert into login_usuarios (id_usuario, email, senha_hash, jwt_token, validade_token)
    select id_usuario,
           'user' || id_usuario || '@teste.com',
           left(md5(id_usuario::text) || md5(id_usuario::text || 'x'), 60),
           null,
           now() + interval '1 day'
    from usuarios;
    get diagnostics n = row_count;
    perform bench_log('login_usuarios', t0, n);
    -- motoristas e proprietarios
    t0 := clock_timestamp();
    insert into motoristas (id_usuario)
    select id_usuario from usuarios where id_usuario <= cfg.qtd_motoristas;
    get diagnostics n = row_count;
    perform bench_log('motoristas', t0, n);
    t0 := clock_timestamp();
    insert into proprietarios (id_usuario)
    select id_usuario from usuarios
    where id_usuario >  cfg.qtd_motoristas
      and id_usuario <= cfg.qtd_motoristas + cfg.qtd_proprietarios;
    get diagnostics n = row_count;
    perform bench_log('proprietarios', t0, n);
    -- operadores e administradores
    t0 := clock_timestamp();
    insert into operadores_estacionamento (id_usuario, id_proprietario, id_cargo)
    select u.id_usuario,
           1 + (u.id_usuario % cfg.qtd_proprietarios),
           (select id_cargo from cargos where nome_cargo = 'operador_estacionamento')
    from usuarios u
    where u.id_usuario > cfg.qtd_motoristas + cfg.qtd_proprietarios
    order by u.id_usuario
    limit 5000;
    get diagnostics n = row_count;
    perform bench_log('operadores_estacionamento', t0, n);
    insert into administradores_plataforma (id_usuario, id_cargo)
    select u.id_usuario,
           (select id_cargo from cargos where nome_cargo = 'adm_plataforma')
    from usuarios u
    where u.id_usuario > cfg.qtd_motoristas + cfg.qtd_proprietarios + 5000
    order by u.id_usuario
    limit 20;
    -- estacionamentos
    t0 := clock_timestamp();
    insert into estacionamentos (id_proprietario, id_endereco, qtd_vagas_idoso, qtd_vagas_pcd,
                                 qtd_vagas_comum, lotacao_atual, nome, hr_abertura, hr_fechamento,
                                 num_alvara, validade_alvara)
    select 1 + (g % cfg.qtd_proprietarios),
           g,
           5, 5, 50 + (g % 100), 0,
           'Estacionamento ' || g,
           time '06:00', time '22:00',
           'ALV-' || g,
           current_date + 365
    from generate_series(1, cfg.qtd_estacionamentos) g;
    get diagnostics n = row_count;
    perform bench_log('estacionamentos', t0, n);
    -- veiculos
    t0 := clock_timestamp();
    insert into veiculos (id_dono, id_tipo, modelo, placa, cor)
    select 1 + floor(random() * cfg.qtd_motoristas)::int,
           v_tipos[1 + (g % array_length(v_tipos, 1))],
           'Modelo ' || (g % 50),
           'T' || lpad(g::text, 6, '0'),
           (array['preto','branco','prata','vermelho','azul'])[1 + (g % 5)]
    from generate_series(1, cfg.qtd_veiculos) g;
    get diagnostics n = row_count;
    perform bench_log('veiculos', t0, n);
    -- motoristas_autorizados
    t0 := clock_timestamp();
    insert into motoristas_autorizados (id_motorista, id_veiculo)
    select 1 + floor(random() * cfg.qtd_motoristas)::int, g
    from generate_series(1, least(100000, cfg.qtd_veiculos)) g;
    get diagnostics n = row_count;
    perform bench_log('motoristas_autorizados', t0, n);
    -- tarifas (tarifa antiga + tarifa vigente, por estacionamento e tipo)
    t0 := clock_timestamp();
    insert into tarifas (id_estacionamento, id_tipo, vlr_hora, tolerancia_min, multa_excedente,
                         vigente_de, vigente_ate)
    select e.id_estacionamento,
           t.id_tipo,
           round((3 + random() * 12)::numeric, 2),
           10 + (e.id_estacionamento % 3) * 5,
           5.00,
           v.de,
           v.ate
    from estacionamentos e
    cross join tipos_veiculos t
    cross join (values (current_date - 365, current_date - 31),
                       (current_date - 30,  null::date)) as v(de, ate);
    get diagnostics n = row_count;
    perform bench_log('tarifas', t0, n);
    -- reservas (volume principal)
    t0 := clock_timestamp();
    insert into reservas (id_motorista, id_estacionamento, id_veiculo, id_status,
                          dt_inicio_previsto, dt_fim_previsto, dt_inicio_real, dt_fim_real,
                          valor, codigo_voucher)
    select b.id_motorista, b.id_estacionamento, b.id_veiculo, b.id_status,
           b.ini,
           b.ini + b.dur,
           case when b.id_status in (s_atras, s_concl) then b.ini + b.atraso end,
           case when b.id_status in (s_atras, s_concl) then b.ini + b.dur + b.atraso end,
           b.valor,
           b.voucher
    from (
        select 1 + floor(random() * cfg.qtd_motoristas)::int      as id_motorista,
               1 + floor(random() * cfg.qtd_estacionamentos)::int as id_estacionamento,
               1 + floor(random() * cfg.qtd_veiculos)::int        as id_veiculo,
               (array[s_conf, s_canc, s_atras, s_concl, s_concl, s_concl, s_concl, s_concl, s_concl, s_concl])
                   [1 + floor(random() * 10)::int]                as id_status,
               now() + interval '7 days'
                     - make_interval(secs => floor(random() * 372 * 86400))  as ini,
               make_interval(mins => 30 + floor(random() * 480)::int)       as dur,
               make_interval(mins => floor(random() * 20)::int)             as atraso,
               round((10 + random() * 90)::numeric, 2)                      as valor,
               lpad(floor(random() * 10000)::int::text, 4, '0')             as voucher
        from generate_series(1, cfg.qtd_reservas)
    ) b;
    get diagnostics n = row_count;
    perform bench_log('reservas', t0, n);
    -- transacoes (1 por reserva)
    t0 := clock_timestamp();
    insert into transacoes (id_reserva, valor, dt_transacao, id_tr_status, metodo_pagamento)
    select r2.id_reserva,
           r2.valor,
           r2.dt_inicio_previsto - interval '1 hour',
           case when r2.id_status = s_canc then p_canc
                when r2.id_reserva % 25 = 0 then p_recus
                else p_aprov end,
           (array['pix','cartao_credito','cartao_debito'])[1 + floor(random() * 3)::int]
    from reservas r2;
    get diagnostics n = row_count;
    perform bench_log('transacoes', t0, n);
end;
$seed$;

-- Atualiza as estatisticas do planner (essencial para planos realistas)
analyze;

-- Contagem final das tabelas
select 'usuarios' as tabela, count(*) as linhas from usuarios
union all select 'motoristas', count(*) from motoristas
union all select 'proprietarios', count(*) from proprietarios
union all select 'estacionamentos', count(*) from estacionamentos
union all select 'veiculos', count(*) from veiculos
union all select 'tarifas', count(*) from tarifas
union all select 'reservas', count(*) from reservas
union all select 'transacoes', count(*) from transacoes;

-- ============================================================================
-- 3. PARAMETROS DOS TESTES: escolhe uma reserva REAL (do meio da tabela) e
--    deriva dela motorista, estacionamento, veiculo, usuario, email, etc.
--    Assim os testes funcionam com qualquer conjunto de dados e de IDs.
-- ============================================================================

delete from bench_params;

do $params$
declare
    ref   record;
    v_n   bigint;
    v_n2  bigint;
begin
    select count(*) into v_n from reservas;
    if v_n = 0 then
        raise exception 'A tabela reservas esta vazia: nao ha o que testar. Rode a carga (secao 2).';
    end if;
    select x.id_reserva, x.id_motorista, x.id_estacionamento, x.id_veiculo, x.dt_inicio_previsto
      into ref
      from reservas x
     order by x.id_reserva
    offset (v_n / 2) limit 1;
    insert into bench_params values
        ('reserva', ref.id_reserva::text),
        ('mot',     ref.id_motorista::text),
        ('est',     ref.id_estacionamento::text),
        ('vei',     ref.id_veiculo::text),
        ('ref',     ref.dt_inicio_previsto::text);
    insert into bench_params
        select 'usuario', m.id_usuario::text from motoristas m where m.id_motorista = ref.id_motorista;
    insert into bench_params
        select 'prop', e.id_proprietario::text from estacionamentos e where e.id_estacionamento = ref.id_estacionamento;
    insert into bench_params
        select 'tipo', v.id_tipo::text from veiculos v where v.id_veiculo = ref.id_veiculo;
    insert into bench_params
        select 'placa', v.placa from veiculos v where v.id_veiculo = ref.id_veiculo;
    insert into bench_params
        select 'email', l.email from login_usuarios l join motoristas m on m.id_usuario = l.id_usuario
        where m.id_motorista = ref.id_motorista;
    insert into bench_params
        select 'cpf', u.cpf_cnpj from usuarios u join motoristas m on m.id_usuario = u.id_usuario
        where m.id_motorista = ref.id_motorista;
    select count(*) into v_n2 from reservas where dt_fim_real is not null;
    insert into bench_params
        select 'dia', ((x.dt_fim_real at time zone 'America/Sao_Paulo')::date)::text
          from reservas x where x.dt_fim_real is not null
         order by x.id_reserva offset (v_n2 / 2) limit 1;
    insert into bench_params select 'st_conf',  id_status::text from status_reserva where status_nome = 'confirmada';
    insert into bench_params select 'st_canc',  id_status::text from status_reserva where status_nome = 'cancelada';
    insert into bench_params select 'st_atras', id_status::text from status_reserva where status_nome = 'atrasada';
    insert into bench_params select 'st_concl', id_status::text from status_reserva where status_nome = 'concluida';
    insert into bench_params select 'tr_pend',  id_tr_status::text from status_transacao where tr_status_nome = 'pendente';
    -- valores de reserva caso algum dado nao exista (o teste correspondente apenas retorna 0 linhas)
    insert into bench_params values
        ('email', 'sem@email'), ('placa', 'SEMPLACA'), ('cpf', '00000000000'),
        ('dia', current_date::text), ('usuario', '0'), ('prop', '0'), ('tipo', '0'),
        ('st_conf', '0'), ('st_canc', '0'), ('st_atras', '0'), ('st_concl', '0'), ('tr_pend', '0')
    on conflict (chave) do nothing;
end;
$params$;

select chave, valor from bench_params order by chave;

-- ============================================================================
-- 4. ZERA ESTATISTICAS (para medir o uso real dos indices nos testes)
-- ============================================================================

do $$ begin perform pg_stat_reset(); exception when others then raise notice 'pg_stat_reset indisponivel: %', sqlerrm; end $$;

-- ============================================================================
-- 5. BENCHMARK DE LEITURA   call bench(grupo, teste, sql, repeticoes);
--    {placeholders} sao trocados pelos IDs reais da secao 3.
-- ============================================================================

-- ---- 5.1 SELECTs individuais ------------------------------------------------

call bench('1_select', 'usuario por PK',
    $q$ select * from usuarios where id_usuario = {usuario} $q$, 100);

call bench('1_select', 'usuario por CPF (unique)',
    $q$ select * from usuarios where cpf_cnpj = '{cpf}' $q$, 100);

call bench('1_select', 'login por email (unique)',
    $q$ select * from login_usuarios where email = '{email}' $q$, 100);

call bench('1_select', 'veiculo por placa (unique)',
    $q$ select * from veiculos where placa = '{placa}' $q$, 100);

call bench('1_select', 'reserva por PK',
    $q$ select * from reservas where id_reserva = {reserva} $q$, 100);

call bench('1_select', 'veiculos de um motorista',
    $q$ select * from veiculos where id_dono = {mot} $q$, 100);

call bench('1_select', 'estacionamentos de um proprietario',
    $q$ select * from estacionamentos where id_proprietario = {prop} $q$, 100);

call bench('1_select', 'reservas de um estacionamento (janela +-7 dias) [index_R_estac_inicio]',
    $q$ select * from reservas
        where id_estacionamento = {est}
          and dt_inicio_previsto >= '{ref}'::timestamptz - interval '7 days'
          and dt_inicio_previsto <  '{ref}'::timestamptz + interval '7 days' $q$, 50);

call bench('1_select', 'historico do motorista (ultimas 20) [index_R_motorista]',
    $q$ select * from reservas where id_motorista = {mot}
        order by dt_inicio_previsto desc limit 20 $q$, 50);

call bench('1_select', 'tarifa vigente de estacionamento/tipo',
    $q$ select * from tarifas
        where id_estacionamento = {est} and id_tipo = {tipo}
          and vigente_de <= current_date
          and (vigente_ate is null or vigente_ate >= current_date) $q$, 100);

call bench('1_select', 'reservas finalizadas em um dia [index_R_fim_real]',
    $q$ select count(*), sum(valor) from reservas
        where (dt_fim_real at time zone 'America/Sao_Paulo')::date = '{dia}'::date $q$, 20);

call bench('1_select', 'count por status (baixa seletividade)',
    $q$ select count(*) from reservas where id_status = {st_conf} $q$, 5);

call bench('1_select', 'count(*) total de reservas',
    $q$ select count(*) from reservas $q$, 5);

call bench('1_select', 'SEM INDICE: voucher (seq scan proposital)',
    $q$ select count(*) from reservas where codigo_voucher = '0042' $q$, 3);

call bench('1_select', 'SEM INDICE: nome LIKE prefixo',
    $q$ select count(*) from usuarios where nome like 'Usuario 1234%' $q$, 5);

call bench('1_select', 'SEM INDICE: nome LIKE %meio%',
    $q$ select count(*) from usuarios where nome like '%1234%' $q$, 5);

-- ---- 5.2 JOINs --------------------------------------------------------------

call bench('2_join', 'reservas + estac + veiculo + motorista + usuario (30 dias)',
    $q$ select r.id_reserva, r.valor, e.nome, v.placa, u.nome as motorista
        from reservas r
        join estacionamentos e on e.id_estacionamento = r.id_estacionamento
        join veiculos v        on v.id_veiculo = r.id_veiculo
        join motoristas m      on m.id_motorista = r.id_motorista
        join usuarios u        on u.id_usuario = m.id_usuario
        where r.id_estacionamento = {est}
          and r.dt_inicio_previsto >= '{ref}'::timestamptz - interval '30 days'
          and r.dt_inicio_previsto <= '{ref}'::timestamptz $q$, 30);

call bench('2_join', 'receita de um proprietario (todos estacionamentos, 30 dias)',
    $q$ select e.id_estacionamento, count(*) as qtd, sum(r.valor) as total
        from estacionamentos e
        join reservas r on r.id_estacionamento = e.id_estacionamento
        where e.id_proprietario = {prop}
          and r.dt_inicio_previsto >= '{ref}'::timestamptz - interval '30 days'
          and r.dt_inicio_previsto <= '{ref}'::timestamptz
        group by e.id_estacionamento $q$, 20);

call bench('2_join', 'transacoes por metodo/status (100 estacionamentos)',
    $q$ select t.metodo_pagamento, s.tr_status_nome, count(*), sum(t.valor)
        from transacoes t
        join status_transacao s on s.id_tr_status = t.id_tr_status
        join reservas r         on r.id_reserva = t.id_reserva
        where r.id_estacionamento between {est} and {est} + 99
        group by 1, 2 $q$, 5);

call bench('2_join', 'perfil completo de um motorista (login + veiculos + tipo)',
    $q$ select u.nome, l.email, v.placa, tv.tipo
        from motoristas m
        join usuarios u        on u.id_usuario = m.id_usuario
        join login_usuarios l  on l.id_usuario = u.id_usuario
        left join veiculos v   on v.id_dono = m.id_motorista
        left join tipos_veiculos tv on tv.id_tipo = v.id_tipo
        where m.id_motorista = {mot} $q$, 100);

call bench('2_join', 'reserva x tarifa vigente na data (50 estacionamentos)',
    $q$ select count(*), sum(t.vlr_hora)
        from reservas r
        join veiculos v on v.id_veiculo = r.id_veiculo
        join tarifas t  on t.id_estacionamento = r.id_estacionamento
                       and t.id_tipo = v.id_tipo
                       and r.dt_inicio_previsto::date between t.vigente_de
                                                          and coalesce(t.vigente_ate, date '9999-12-31')
        where r.id_estacionamento between {est} and {est} + 49 $q$, 5);

call bench('2_join', 'PESADO: reservas por UF (6 tabelas, tabela inteira)',
    $q$ select es.uf, count(*) as reservas, sum(r.valor) as total
        from reservas r
        join estacionamentos e on e.id_estacionamento = r.id_estacionamento
        join enderecos en      on en.id_endereco = e.id_endereco
        join municipios mu     on mu.id_municipio = en.id_municipio
        join estados es        on es.id_estado = mu.id_estado
        group by es.uf $q$, 3);

-- ---- 5.3 Agregacoes e funcoes de janela -------------------------------------

call bench('3_agregacao', 'top 20 proprietarios por receita (30 dias)',
    $q$ select e.id_proprietario, sum(r.valor) as total
        from reservas r
        join estacionamentos e using (id_estacionamento)
        where r.id_status = {st_concl}
          and r.dt_inicio_previsto >= '{ref}'::timestamptz - interval '30 days'
          and r.dt_inicio_previsto <= '{ref}'::timestamptz
        group by 1 order by 2 desc limit 20 $q$, 5);

call bench('3_agregacao', 'top 20 estacionamentos por receita (tabela inteira)',
    $q$ select id_estacionamento, sum(valor) as total
        from reservas where id_status = {st_concl}
        group by 1 order by total desc limit 20 $q$, 3);

call bench('3_agregacao', 'receita por dia (tabela inteira)',
    $q$ select (dt_fim_real at time zone 'America/Sao_Paulo')::date as dia,
               count(*), sum(valor)
        from reservas where dt_fim_real is not null
        group by 1 order by 1 $q$, 3);

call bench('3_agregacao', 'ocupacao por hora de um estacionamento',
    $q$ select extract(hour from dt_inicio_previsto at time zone 'America/Sao_Paulo') as hora,
               count(*)
        from reservas where id_estacionamento = {est}
        group by 1 order by 1 $q$, 30);

call bench('3_agregacao', 'count(distinct motorista) na tabela inteira',
    $q$ select count(distinct id_motorista) from reservas $q$, 3);

call bench('3_agregacao', 'window: top 3 reservas por estacionamento (500 estac.)',
    $q$ select * from (
            select id_estacionamento, id_reserva, valor,
                   row_number() over (partition by id_estacionamento order by valor desc) as rn
            from reservas where id_estacionamento between {est} and {est} + 499
        ) x where rn <= 3 $q$, 3);

call bench('3_agregacao', 'window: receita acumulada diaria (90 dias)',
    $q$ select dia, total, sum(total) over (order by dia) as acumulado
        from (
            select (dt_fim_real at time zone 'America/Sao_Paulo')::date as dia, sum(valor) as total
            from reservas
            where id_status = {st_concl}
              and dt_fim_real >= '{ref}'::timestamptz - interval '90 days'
              and dt_fim_real <= '{ref}'::timestamptz
            group by 1
        ) x order by dia $q$, 3);

call bench('3_agregacao', 'percentis de valor (p50/p90/p99)',
    $q$ select percentile_cont(array[0.5, 0.9, 0.99]) within group (order by valor)
        from reservas where id_estacionamento between {est} and {est} + 199 $q$, 3);

-- ---- 5.4 UNION ALL / UNION --------------------------------------------------

call bench('4_union', 'UNION ALL: resumo por periodo (7/30/90/365 dias)',
    $q$ select '7d' as periodo, count(*) as qtd, coalesce(sum(valor), 0) as total
          from reservas where dt_inicio_previsto >= '{ref}'::timestamptz - interval '7 days' and dt_inicio_previsto <= '{ref}'::timestamptz
        union all
        select '30d', count(*), coalesce(sum(valor), 0)
          from reservas where dt_inicio_previsto >= '{ref}'::timestamptz - interval '30 days' and dt_inicio_previsto <= '{ref}'::timestamptz
        union all
        select '90d', count(*), coalesce(sum(valor), 0)
          from reservas where dt_inicio_previsto >= '{ref}'::timestamptz - interval '90 days' and dt_inicio_previsto <= '{ref}'::timestamptz
        union all
        select '365d', count(*), coalesce(sum(valor), 0)
          from reservas where dt_inicio_previsto >= '{ref}'::timestamptz - interval '365 days' and dt_inicio_previsto <= '{ref}'::timestamptz $q$, 5);

call bench('4_union', 'UNION ALL: contagem por status (4 consultas)',
    $q$ select 'confirmada' as status, count(*) from reservas where id_status = {st_conf}
        union all select 'cancelada', count(*) from reservas where id_status = {st_canc}
        union all select 'atrasada',  count(*) from reservas where id_status = {st_atras}
        union all select 'concluida', count(*) from reservas where id_status = {st_concl} $q$, 3);

call bench('4_union', 'UNION ALL: contagem de varias tabelas',
    $q$ select 'usuarios' as tabela, count(*) from usuarios
        union all select 'motoristas',      count(*) from motoristas
        union all select 'proprietarios',   count(*) from proprietarios
        union all select 'estacionamentos', count(*) from estacionamentos
        union all select 'veiculos',        count(*) from veiculos
        union all select 'transacoes',      count(*) from transacoes $q$, 5);

call bench('4_union', 'UNION ALL: papeis dos usuarios (motorista/proprietario/operador)',
    $q$ select count(*) from (
            select id_usuario, 'motorista' as papel from motoristas
            union all
            select id_usuario, 'proprietario' from proprietarios
            union all
            select id_usuario, 'operador' from operadores_estacionamento
        ) x $q$, 10);

call bench('4_union', 'UNION ALL: 3 "ultimas 10 reservas" de estacionamentos diferentes',
    $q$ (select * from reservas where id_estacionamento = {est} order by dt_inicio_previsto desc limit 10)
        union all
        (select * from reservas where id_estacionamento = {est} + 1 order by dt_inicio_previsto desc limit 10)
        union all
        (select * from reservas where id_estacionamento = {est} + 2 order by dt_inicio_previsto desc limit 10) $q$, 50);

call bench('4_union', 'UNION (com dedup) de motoristas - para comparar',
    $q$ select count(*) from (
            select id_motorista from reservas where id_status = {st_conf}
            union
            select id_motorista from reservas where id_status = {st_concl}
        ) x $q$, 3);

call bench('4_union', 'UNION ALL (sem dedup) de motoristas - mesmo volume',
    $q$ select count(*) from (
            select id_motorista from reservas where id_status = {st_conf}
            union all
            select id_motorista from reservas where id_status = {st_concl}
        ) x $q$, 3);

-- ---- 5.5 Subqueries, CTE, LATERAL, ordenacao --------------------------------

call bench('5_subquery', 'NOT EXISTS: motoristas sem reserva',
    $q$ select count(*) from motoristas m
        where not exists (select 1 from reservas r where r.id_motorista = m.id_motorista) $q$, 3);

call bench('5_subquery', 'IN (subquery): veiculos de quem reservou no estacionamento',
    $q$ select count(*) from veiculos
        where id_dono in (select id_motorista from reservas where id_estacionamento = {est}) $q$, 20);

call bench('5_subquery', 'LATERAL: ultimas 5 reservas de 500 estacionamentos',
    $q$ select e.id_estacionamento, r.id_reserva, r.valor, r.dt_inicio_previsto
        from estacionamentos e
        cross join lateral (
            select id_reserva, valor, dt_inicio_previsto
            from reservas r
            where r.id_estacionamento = e.id_estacionamento
            order by dt_inicio_previsto desc limit 5
        ) r
        where e.id_estacionamento between {est} and {est} + 499 $q$, 5);

call bench('5_subquery', 'subquery correlacionada: confirmadas por estacionamento (1000)',
    $q$ select e.id_estacionamento,
               (select count(*) from reservas r
                 where r.id_estacionamento = e.id_estacionamento and r.id_status = {st_conf})
        from estacionamentos e where e.id_estacionamento between {est} and {est} + 999 $q$, 5);

call bench('5_subquery', 'CTE: top 10 estacionamentos por receita',
    $q$ with receita as (
            select id_estacionamento, sum(valor) as total
            from reservas where id_status = {st_concl} group by 1
        )
        select e.nome, receita.total
        from receita join estacionamentos e on e.id_estacionamento = receita.id_estacionamento
        order by receita.total desc limit 10 $q$, 3);

call bench('5_subquery', 'ORDER BY valor DESC LIMIT 100 (top-N, tabela inteira)',
    $q$ select * from reservas order by valor desc limit 100 $q$, 3);

call bench('5_subquery', 'ANTI-PADRAO: paginacao com OFFSET 1.000.000',
    $q$ select * from reservas order by dt_inicio_previsto desc offset 1000000 limit 10 $q$, 2);

-- ============================================================================
-- 6. BENCHMARK DE ESCRITA
--    Tudo que e inserido leva o marcador 'BNCH' e e removido no final.
--    Os UPDATEs de lotacao somam e subtraem 1, entao o valor final nao muda.
-- ============================================================================

call bench('6_escrita', 'INSERT em lote: 10.000 reservas',
    $q$ insert into reservas (id_motorista, id_estacionamento, id_veiculo, id_status,
                              dt_inicio_previsto, dt_fim_previsto, valor, codigo_voucher)
        select m.id_motorista, e.id_estacionamento, v.id_veiculo,
               {st_conf},
               now() + interval '1 day', now() + interval '1 day 2 hours', 10.00, 'BNCH'
        from generate_series(1, 10000) g
        join (select id_motorista, row_number() over (order by id_motorista) as rn,
                     count(*) over () as qtd from motoristas) m
             on m.rn = 1 + (g % m.qtd)
        join (select id_estacionamento, row_number() over (order by id_estacionamento) as rn,
                     count(*) over () as qtd from estacionamentos) e
             on e.rn = 1 + (g % e.qtd)
        join (select id_veiculo, row_number() over (order by id_veiculo) as rn,
                     count(*) over () as qtd from veiculos) v
             on v.rn = 1 + (g % v.qtd) $q$, 3);

call bench('6_escrita', 'INSERT em lote: transacoes das reservas BNCH',
    $q$ insert into transacoes (id_reserva, valor, id_tr_status, metodo_pagamento)
        select id_reserva, valor, {tr_pend}, 'pix' from reservas where codigo_voucher = 'BNCH' $q$, 1);

call bench('6_escrita', 'UPDATE 10.000 linhas por faixa de PK (coluna nao indexada)',
    $q$ update reservas set valor = valor + 0 where id_reserva between {reserva} and {reserva} + 9999 $q$, 3);

call bench('6_escrita', 'UPDATE coluna indexada (id_status) nas reservas BNCH',
    $q$ update reservas set id_status = {st_canc} where codigo_voucher = 'BNCH' $q$, 1);

call bench('6_escrita', 'UPDATE de linha unica (lotacao_atual) x1000 +1/-1',
    $q$ do $$ begin
            for i in 1..1000 loop
                update estacionamentos set lotacao_atual = lotacao_atual + 1 where id_estacionamento = {est};
                update estacionamentos set lotacao_atual = lotacao_atual - 1 where id_estacionamento = {est};
            end loop;
        end $$ $q$, 3);

call bench('6_escrita', 'PROCEDURE gerar_resumo_financeiro (1 dia)',
    $q$ call gerar_resumo_financeiro('{dia}'::date) $q$, 3);

call bench('6_escrita', 'PROCEDURE gerar_resumo_financeiro (30 dias seguidos)',
    $q$ do $$ begin
            for i in 0..29 loop
                call gerar_resumo_financeiro('{dia}'::date - i);
            end loop;
        end $$ $q$, 1);

call bench('6_escrita', 'DELETE em lote: transacoes das reservas BNCH',
    $q$ delete from transacoes t using reservas r
        where t.id_reserva = r.id_reserva and r.codigo_voucher = 'BNCH' $q$, 1);

call bench('6_escrita', 'DELETE em lote: reservas BNCH',
    $q$ delete from reservas where codigo_voucher = 'BNCH' $q$, 1);

-- ============================================================================
-- 7. PLANOS DE EXECUCAO (cada SELECT devolve as linhas do EXPLAIN ANALYZE)
--    Procure: Index Scan x Seq Scan, "Buffers: shared hit/read",
--    "Rows Removed by Filter" e o tempo real. Rode um por vez (Ctrl+Enter).
-- ============================================================================

-- 7.1 Deve usar index_R_estac_inicio
select * from bench_explain($q$ select * from reservas
    where id_estacionamento = {est}
      and dt_inicio_previsto >= '{ref}'::timestamptz - interval '7 days'
      and dt_inicio_previsto <  '{ref}'::timestamptz + interval '7 days' $q$);

-- 7.2 Deve usar index_R_fim_real (a expressao precisa ser IDENTICA a do indice)
select * from bench_explain($q$ select count(*) from reservas
    where (dt_fim_real at time zone 'America/Sao_Paulo')::date = '{dia}'::date $q$);

-- 7.3 Mesma consulta com date(): NAO usa o indice (compare com a 7.2)
select * from bench_explain($q$ select count(*) from reservas
    where date(dt_fim_real) = '{dia}'::date $q$);

-- 7.4 Seq scan proposital (sem indice em codigo_voucher)
select * from bench_explain($q$ select count(*) from reservas where codigo_voucher = '0042' $q$);

-- 7.5 Join pesado
select * from bench_explain($q$ select es.uf, count(*), sum(r.valor)
    from reservas r
    join estacionamentos e on e.id_estacionamento = r.id_estacionamento
    join enderecos en      on en.id_endereco = e.id_endereco
    join municipios mu     on mu.id_municipio = en.id_municipio
    join estados es        on es.id_estado = mu.id_estado
    group by es.uf $q$);

-- 7.6 Consulta interna da procedure gerar_resumo_financeiro (usa date() => seq scan)
select * from bench_explain($q$ select e.id_proprietario, sum(r.valor), count(*)
    from reservas r
    join estacionamentos e on e.id_estacionamento = r.id_estacionamento
    where date(r.dt_fim_real) = '{dia}'::date
    group by e.id_proprietario $q$);

-- ============================================================================
-- 8. CARGA EM LOOP (substitui o pgbench). Mede vazao (fluxos por segundo).
--    Altere v_iteracoes para aumentar/diminuir a carga.
--    PARA CONCORRENCIA: abra varios editores SQL e execute o mesmo bloco ao
--    mesmo tempo; compare o tempo medio por iteracao com a execucao isolada.
-- ============================================================================

-- 8.1 LEITURA: 6 consultas por iteracao com IDs sorteados entre os existentes
do $leitura$
declare
    v_iteracoes int := 5000;
    i           int;
    t0          timestamptz := clock_timestamp();
    ms          numeric;
    ids_usu     int[] := (select array_agg(id_usuario)      from login_usuarios);
    ids_mot     int[] := (select array_agg(id_motorista)    from motoristas);
    ids_est     int[] := (select array_agg(id_estacionamento) from estacionamentos);
    ids_prop    int[] := (select array_agg(id_proprietario) from proprietarios);
    v_ref       timestamptz := (select valor::timestamptz from bench_params where chave = 'ref');
    v_usu       int;
    v_mot       int;
    v_est       int;
    v_prop      int;
begin
    for i in 1..v_iteracoes loop
        v_usu  := ids_usu [1 + floor(random() * array_length(ids_usu, 1))::int];
        v_mot  := ids_mot [1 + floor(random() * array_length(ids_mot, 1))::int];
        v_est  := ids_est [1 + floor(random() * array_length(ids_est, 1))::int];
        v_prop := ids_prop[1 + floor(random() * array_length(ids_prop, 1))::int];
        perform id_login, senha_hash from login_usuarios where email = 'user' || v_usu || '@teste.com';
        perform * from usuarios where id_usuario = v_usu;
        perform * from reservas where id_motorista = v_mot order by dt_inicio_previsto desc limit 20;
        perform * from reservas where id_estacionamento = v_est
            and dt_inicio_previsto >= v_ref - interval '7 days' and dt_inicio_previsto < v_ref + interval '7 days';
        perform * from tarifas where id_estacionamento = v_est and vigente_ate is null;
        perform count(*), sum(r.valor) from reservas r join estacionamentos e on e.id_estacionamento = r.id_estacionamento
            where e.id_proprietario = v_prop and r.dt_inicio_previsto >= v_ref - interval '30 days' and r.dt_inicio_previsto <= v_ref;
    end loop;
    ms := extract(epoch from (clock_timestamp() - t0)) * 1000;
    insert into bench_resultados (grupo, teste, repeticoes, tempo_total_ms, tempo_medio_ms, linhas)
    values ('7_carga_loop', 'LEITURA: 6 consultas por iteracao', v_iteracoes, round(ms, 2), round(ms / v_iteracoes, 3), v_iteracoes * 6);
    raise notice 'LEITURA: % iteracoes em % ms (% iteracoes/s)', v_iteracoes, round(ms), round(v_iteracoes / (ms / 1000));
end;
$leitura$;

-- 8.2 ESCRITA: reserva + transacao + atualizacao da lotacao (+1 e -1) por iteracao
--     Os registros levam o marcador 'LOOP' e sao removidos pelo 8.3.
do $escrita$
declare
    v_iteracoes int := 5000;
    i           int;
    t0          timestamptz := clock_timestamp();
    ms          numeric;
    ids_mot     int[] := (select array_agg(id_motorista)      from motoristas);
    ids_est     int[] := (select array_agg(id_estacionamento) from estacionamentos);
    ids_vei     int[] := (select array_agg(id_veiculo)        from veiculos);
    v_est       int;
    v_conf      int := (select valor::int from bench_params where chave = 'st_conf');
    v_pend      int := (select valor::int from bench_params where chave = 'tr_pend');
begin
    for i in 1..v_iteracoes loop
        v_est := ids_est[1 + floor(random() * array_length(ids_est, 1))::int];
        with nova as (
            insert into reservas (id_motorista, id_estacionamento, id_veiculo, id_status,
                                  dt_inicio_previsto, dt_fim_previsto, valor, codigo_voucher)
            values (ids_mot[1 + floor(random() * array_length(ids_mot, 1))::int],
                    v_est,
                    ids_vei[1 + floor(random() * array_length(ids_vei, 1))::int],
                    v_conf,
                    now() + interval '1 hour', now() + interval '3 hours', 12.50, 'LOOP')
            returning id_reserva
        )
        insert into transacoes (id_reserva, valor, id_tr_status, metodo_pagamento)
        select id_reserva, 12.50, v_pend, 'pix' from nova;
        update estacionamentos set lotacao_atual = lotacao_atual + 1 where id_estacionamento = v_est;
        update estacionamentos set lotacao_atual = lotacao_atual - 1 where id_estacionamento = v_est;
    end loop;
    ms := extract(epoch from (clock_timestamp() - t0)) * 1000;
    insert into bench_resultados (grupo, teste, repeticoes, tempo_total_ms, tempo_medio_ms, linhas)
    values ('7_carga_loop', 'ESCRITA: reserva + transacao + lotacao por iteracao', v_iteracoes, round(ms, 2), round(ms / v_iteracoes, 3), v_iteracoes);
    raise notice 'ESCRITA: % iteracoes em % ms (% iteracoes/s)', v_iteracoes, round(ms), round(v_iteracoes / (ms / 1000));
end;
$escrita$;

-- 8.3 Remove os registros 'LOOP' da escrita acima (rode depois de terminar
--     TODAS as abas simultaneas)
delete from transacoes where id_reserva in (select id_reserva from reservas where codigo_voucher = 'LOOP');

delete from reservas where codigo_voucher = 'LOOP';

-- ============================================================================
-- 9. RELATORIO
-- ============================================================================

-- 9.1 Todos os testes, na ordem de execucao (coluna erro preenchida = o teste falhou)
select id, grupo, teste, repeticoes, tempo_medio_ms, tempo_min_ms, tempo_max_ms, linhas, erro
from bench_resultados
where grupo <> 'carga'
order by id;

-- 9.2 Os 15 mais lentos (tempo medio)
select grupo, teste, tempo_medio_ms, tempo_max_ms
from bench_resultados
where grupo <> 'carga' and erro is null
order by tempo_medio_ms desc
limit 15;

-- 9.3 Resumo por grupo
select grupo,
       count(*)                      as testes,
       round(avg(tempo_medio_ms), 2) as media_ms,
       round(max(tempo_medio_ms), 2) as pior_ms
from bench_resultados
where grupo <> 'carga' and erro is null
group by grupo
order by grupo;

-- 9.4 Velocidade da carga (linhas por segundo)
select teste as tabela, linhas, tempo_total_ms,
       round(linhas / nullif(tempo_total_ms / 1000, 0)) as linhas_por_seg
from bench_resultados
where grupo = 'carga'
order by id;

-- 9.5 Tamanho de tabelas e indices
select relname as tabela,
       n_live_tup as linhas_estimadas,
       pg_size_pretty(pg_relation_size(relid))       as tabela_dados,
       pg_size_pretty(pg_indexes_size(relid))        as indices,
       pg_size_pretty(pg_total_relation_size(relid)) as total
from pg_stat_user_tables
where relname not like 'bench\_%'
order by pg_total_relation_size(relid) desc;

-- 9.6 Uso dos indices durante o teste (idx_scan = 0 => indice nao usado)
select relname as tabela, indexrelname as indice, idx_scan,
       pg_size_pretty(pg_relation_size(indexrelid)) as tamanho
from pg_stat_user_indexes
where relname not like 'bench\_%'
order by idx_scan asc, pg_relation_size(indexrelid) desc;

-- 9.7 Seq scans x index scans por tabela
select relname as tabela, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch,
       round(100.0 * idx_scan / nullif(seq_scan + idx_scan, 0), 1) as pct_uso_indice
from pg_stat_user_tables
where relname not like 'bench\_%'
order by seq_tup_read desc;

-- 9.8 Cache hit ratio (ideal > 99%)
select datname,
       round(100.0 * blks_hit / nullif(blks_hit + blks_read, 0), 2) as cache_hit_pct,
       xact_commit, xact_rollback, temp_files,
       pg_size_pretty(temp_bytes) as temp_bytes
from pg_stat_database
where datname = current_database();

-- 9.9 Tuplas mortas (bloat gerado pelos testes de UPDATE/DELETE)
select relname, n_live_tup, n_dead_tup,
       round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 2) as pct_mortas
from pg_stat_user_tables
where n_dead_tup > 0 and relname not like 'bench\_%'
order by n_dead_tup desc;

-- ============================================================================
-- 10. LIMPEZA (DESCOMENTE e rode so quando quiser)
-- ============================================================================

-- 10.1 Remove qualquer sobra dos testes (marcadores BNCH e LOOP)
-- delete from transacoes where id_reserva in (select id_reserva from reservas where codigo_voucher in ('BNCH', 'LOOP'));
-- delete from reservas where codigo_voucher in ('BNCH', 'LOOP');
-- vacuum analyze reservas;

-- 10.2 Apaga TODOS os dados (mantem tabelas de dominio: cargos, tipos_veiculos,
--      status_reserva, status_transacao) e zera as sequences. Irreversivel!
--      Depois disso a secao 2 recarrega tudo.
-- truncate table transacoes, reservas, motoristas_autorizados, veiculos, tarifas,
--     resumo_financeiro, estacionamentos, operadores_estacionamento,
--     administradores_plataforma, motoristas, proprietarios, login_usuarios,
--     usuarios, enderecos, municipios, estados
-- restart identity cascade;

-- 10.3 Remove a infraestrutura do benchmark
-- drop procedure if exists bench(text, text, text, int);
-- drop function if exists bench_explain(text);
-- drop function if exists bench_sub(text);
-- drop function if exists bench_log(text, timestamptz, bigint);
-- drop table if exists bench_resultados, bench_params, bench_config, bench_tabelas;