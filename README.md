# 🚗 E-Parking - seu guia de estacionamentos

O **E-Parking** é uma plataforma desenvolvida para facilitar a localização e reserva de vagas de estacionamento em grandes centros urbanos (com foco inicial em polos urbanos e turísticos de Santa Catarina). A solução permite que motoristas encontrem estacionamentos próximos ao seu destino, consultem disponibilidade, preços, horários, acessibilidade e avaliações, além de realizarem reservas antecipadamente com bloqueio transacional garantido.

Para proprietários e gestores, a plataforma oferece recursos para gerenciar a ocupação das vagas em tempo real, controlar equipe de operadores, emitir relatórios financeiros e otimizar a utilização dos espaços disponíveis, contando com o cadastro, listagem, atualização e exclusão (CRUD) de unidades de estacionamento.

O projeto também planeja explorar tecnologias de visão computacional, utilizando ferramentas como **OpenCV** e modelos **YOLOv8**, com o objetivo de identificar veículos, controlar o fluxo e monitorar a disponibilidade de vagas por meio da infraestrutura de câmeras já existente nos estacionamentos.

🔗 **Repositório Oficial:** https://github.com/leomb-cell/E-parking

---

## 👥 Equipes do Projeto

**Instituição:** Centro Universitário UNICESUSC — Curso de Análise e Desenvolvimento de Sistemas (ADS21)
**Disciplina:** Projeto Multidisciplinar Integrador II (PMI II) | **Orientador:** Prof. Sérgio Murilo Schütz

### Time da Persona "Proprietários"

| Alunos | GitHub |
| :--- | :--- |
| **Leonardo M. Bitencourte** | https://github.com/leomb-cell |
| **Eduardo Manhães** | https://github.com/Lalodev08 |
| **Nicolas Barreiros** | https://github.com/ |
| **Giovana Ribero** | https://github.com/GiovanaRibero |

### Time da Persona "Motoristas"

| Alunos | GitHub |
| :--- | :--- |
| **Nicollas Bion** | https://github.com/ |
| **Vitor Shultz** | https://github.com/ |
| **Erik Prade** | https://github.com/ErikPrade |
| **Pedro H. Gazzoni** | https://github.com/ |

---

## 📋 Especificação de Requisitos (ERS v2.0)

### Perfis de Acesso (Atores do Sistema)
* **Motorista:** Consulta vagas georreferenciadas, realiza reservas antecipadas, efetua pagamentos e acompanha vouchers ativos.
* **Proprietário:** Cadastra e gerencia unidades de estacionamento (incluindo alvará e divisão de vagas), define tarifas, gerencia operadores e exporta relatórios financeiros.
* **Operador:** Perfil subordinado criado pelo Proprietário para operação diária (validação de entrada/saída, check-in e check-out de veículos).
* **Administrador da Plataforma:** Realiza auditoria, manutenção técnica e governança do ecossistema.

### Principais Requisitos Funcionais (RF)
* **RF-001 a RF-004 (Acesso e Cadastro):** Cadastro e autenticação de Motoristas e Proprietários, além de gestão de equipe de Operadores.
* **RF-005 a RF-008 (Gestão de Estacionamentos e Vagas):** CRUD completo de unidades com validação de **Alvará** (`numeroAlvara`, `validadeAlvara`) e categorização de vagas (**Comuns, PcD e Idoso**).
* **RF-009 a RF-011 (Busca, Reserva e Pagamento):** Busca georreferenciada com filtros, cálculo dinâmico de tarifas e reserva com bloqueio transacional vinculado ao pagamento.
* **RF-012 (Monitoramento em Tempo Real):** Integração híbrida via API REST com sensores físicos e módulo de **Visão Computacional (câmeras IP com OpenCV/YOLOv8)**.
* **RF-013 e RF-014 (Operação e Notificações):** Check-in/check-out via voucher/placa e alertas de expiração de horário.
* **RF-015 (Relatórios Financeiros e BI):** Consolidação de receita total, ticket médio, histórico de lançamentos e exportação de dados em **CSV**.

### Requisitos Não Funcionais (RNF) e Regras de Negócio (RN)
* **RNF:** Tempo de resposta da API `< 500 ms` nas consultas de disponibilidade, arquitetura RESTful desacoplada, conformidade com a **LGPD** e interface responsiva (*Mobile-First*).
* **RN-001 / RN-002 / RN-005:** Prevenção contra *overbooking* (bloqueio atômico da vaga durante o checkout), tolerância de atraso configurável e validação obrigatória de alvará ativo para operação na plataforma.

---

## 📐 Modelagem Computacional e Arquitetura de Dados

A modelagem do sistema contempla **9 Diagramas UML** alinhados diretamente ao schema relacional do banco de dados (`prisma/schema.prisma` e `DB-sql/migration_eparking.sql`):

### Artefatos UML Modelados
1. **Diagrama de Casos de Uso:** Mapeamento das interações entre Motorista, Proprietário, Operador, Administrador e APIs externas (Pagamento e Visão Computacional).
2. **Diagrama de Classes:** Estruturação das entidades `Usuario`, `Proprietario`, `Motorista`, `Operador`, `Estacionamento` (contendo `numeroAlvara`, `validadeAlvara`, `vagasComuns`, `vagasPcD`, `vagasIdoso`), `Vaga`, `Reserva`, `Pagamento` e `Sensor` (abstração para sensores físicos e câmeras OpenCV/YOLOv8).
3. **Diagrama de Objetos:** Instanciação concreta de um cenário real de reserva ativa em um estacionamento cadastrado.
4. **Diagrama de Sequência:** Fluxo cronológico síncrono/assíncrono da reserva e bloqueio transacional da vaga.
5. **Diagrama de Comunicação:** Troca de mensagens entre os objetos de controle, repositório e gateway.
6. **Diagrama de Atividades:** Fluxo operacional completo desde a busca da vaga até o check-out e faturamento.
7. **Diagrama de Máquina de Estados:** Ciclo de vida da **Vaga** (*Livre → Reservada → Ocupada → Manutenção*) e da **Reserva** (*Pendente → Confirmada → Ativa → Concluída / Cancelada*).
8. **Diagrama de Componentes:** Desacoplamento entre Front-end Web/Mobile, API RESTful Node.js, Prisma ORM, Banco Relacional e Módulo de Visão Computacional.
9. **Diagrama de Implantação:** Topologia de servidores em nuvem, banco de dados e infraestrutura local de câmeras nos estacionamentos.

### Modelo Entidade-Relacionamento (Resumo das Entidades Principais)

| Entidade / Tabela | Atributos Principais | Relacionamentos |
| :--- | :--- | :--- |
| **`Usuario`** | `id`, `nome`, `email`, `cpf_cnpj`, `senha_hash`, `perfil` (`MOTORISTA`, `PROPRIETARIO`, `OPERADOR`) | 1:N com `Estacionamento` (Proprietário) e `Reserva` (Motorista) |
| **`Estacionamento`** | `id`, `nome`, `endereco`, `latitude`, `longitude`, `numero_alvara`, `validade_alvara`, `vagas_comuns`, `vagas_pcd`, `vagas_idoso`, `valor_hora` | N:1 com `Proprietario`; 1:N com `Vaga`, `Sensor` e `Reserva` |
| **`Vaga`** | `id`, `codigo`, `tipo` (`COMUM`, `PCD`, `IDOSO`), `status` (`LIVRE`, `RESERVADA`, `OCUPADA`) | N:1 com `Estacionamento`; 1:N com `Reserva` |
| **`Reserva`** | `id`, `codigo_voucher`, `data_hora_inicio`, `duracao_horas`, `valor_total`, `status` | N:1 com `Motorista`, `Estacionamento` e `Vaga`; 1:1 com `Pagamento` |
| **`Pagamento`** | `id`, `metodo` (`PIX`, `CARTAO`, `LOCAL`), `valor`, `status_transacao`, `data_pagamento` | 1:1 com `Reserva` |
| **`Sensor`** | `id`, `tipo_dispositivo` (`CAMERA_YOLO`, `SENSOR_FISICO`), `endpoint_stream`, `ativo` | N:1 com `Estacionamento` |

---

## 🔄 Gestão Ágil — Backlog Scrum (57 Story Points)

O desenvolvimento foi estruturado em **3 Sprints** totalizando **57 Story Points**:

* **Sprint 1 — Núcleo Arquitetural e Prototipação (18 pts):** Modelagem UML/BD, CRUD inicial de estacionamentos, busca georreferenciada e checkout simulado (*sandbox*) para validação do bloqueio de vagas, além do **Protótipo Navegável de Alta Fidelidade no Figma** (9 telas do Portal do Proprietário).
* **Sprint 2 — Operação, Tarifas e Relatórios (31 pts):** Gestão avançada de estacionamentos, equipe de operadores, regras de negócio (`RN-001` a `RN-005`), módulo financeiro com exportação CSV (`RF-015`) e fluxo front-end do Motorista.
* **Sprint 3 — Integração Full-Stack e Evolução PMI III (8 pts + Roadmap):** Integração da API RESTful Node.js + Prisma ORM ao front-end, acoplamento do App do Motorista, gateway real de pagamentos e módulo de visão computacional (**OpenCV + YOLOv8**).

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **HTML5**
- **CSS3**
- **Bootstrap 5** (estilização, componentes e responsividade)
- **JavaScript (ES6+)** (DOM, eventos, validações, `localStorage`, `fetch()`, `async/await` e Web Components / Custom Elements para reutilização de Navbar e Footer)

### Back-end & Banco de Dados (Sprint 3 - Proprietários)
- **Node.js** (API RESTful)
- **Prisma ORM** (`schema.prisma`, `prisma7.config.ts`)
- **SQL** (Scripts de migração e testes em `DB-sql/`)

---

## 🎨 Identidade Visual

### Paleta de Cores

| Categoria | Nome | Código Hex |
| :--- | :--- | :--- |
| **Cor Principal** | Azul Profundo | `#123B5D` |
| **Cor de Destaque** | Azul Vivo | `#1976A8` |
| **Cor de Fundo** | Branco | `#FFFFFF` |

### Fonte
- **Inter** — Google Fonts

---

## 📂 Estrutura e Organização dos Arquivos

### Estrutura Geral do Repositório (Proprietários & Back-end - Sprint 3)

```text
E-parking/
├── DB-sql/                        # Scripts SQL do banco de dados
│   ├── migration_eparking.sql     # Criação das tabelas e estrutura inicial
│   └── e-parking-stress-test.sql  # Dados de teste / carga inicial
├── e-parking_backend/             # API RESTful em Node.js
│   ├── prisma/
│   │   └── schema.prisma          # Modelagem e schema do ORM
│   ├── src/
│   │   ├── repositories/          # Camada de acesso a dados (proprietarios, login, apiExt)
│   │   ├── routes/                # Rotas e endpoints da API
│   │   ├── app.js                 # Inicialização do servidor
│   │   └── db.js                  # Configuração de conexão com o banco
│   ├── package.json
│   └── prisma7.config.ts
├── e-parking_frontend/            # Camada de interface do usuário
│   └── owners_landing_page/       # Interface de gestão para proprietários
│       ├── pages/                 # Módulos de páginas (about_Us, dashboard, edit_estacionamento, login, meus_estacionamentos, register, relatorio)
│       ├── sprint_templates/      # Templates e componentes reutilizáveis
│       ├── static/                # Recursos estáticos globais (components, css, images)
│       ├── api.js                 # Funções de comunicação com a API
│       ├── config.js              # Configurações de URL base da API
│       └── index.html             # Página inicial (Landing Page)
└── README.md