# 🚗 E-Parking - seu guia de estacionamentos



O **E-Parking** é uma plataforma desenvolvida para facilitar a localização e reserva de vagas de estacionamento em grandes centros urbanos. A solução permite que motoristas encontrem estacionamentos próximos ao seu destino, consultem disponibilidade, preços, horários, acessibilidade e avaliações, além de realizarem reservas antecipadamente.



Para proprietários e gestores, a plataforma oferece recursos para gerenciar a ocupação das vagas em tempo real, melhorar o fluxo de entrada e saída e otimizar a utilização dos espaços disponíveis, contando com o cadastro, listagem, atualização e exclusão (CRUD) de unidades de estacionamento.



O projeto também planeja explorar tecnologias de visão computacional, utilizando ferramentas como **OpenCV** e modelos **YOLO**, com o objetivo de identificar veículos, controlar o fluxo e monitorar a disponibilidade de vagas por meio da infraestrutura de câmeras já existente nos estacionamentos.



🔗 **Repositório Oficial:** https://github.com/leomb-cell/E-parking



---



## 👥 Equipes do Projeto



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

```



### Organização dos Arquivos (Motoristas - Sprint 2)



```text

drivers_landing_page/

├── index.html

├── pages/<pagina>/        # HTML, CSS e JS de cada página

├── static/css/            # index.css e feedback.css (mensagens de validação)

├── static/js/             # storage.js (localStorage), validation.js, parkings.js (dados), index.js

└── sprint_templates/      # relatórios das sprints

```



---



## 🚀 Como Rodar o Projeto



### 1. Clonar ou Baixar o Repositório



Baixe o repositório clicando no botão **Code → Download ZIP** ou execute o comando abaixo no terminal:



```bash

git clone https://github.com/leomb-cell/E-parking.git

cd E-parking

```

*(Ou `git clone https://github.com/leomb-cell/projeto_de_desenvolvimento_frontend_I.git`, conforme o repositório utilizado).*



---



### 2. Executando o Projeto com Integração Back-end (Área do Proprietário — Sprint 3)



#### Pré-requisitos

- [Git](https://git-scm.com/)

- [Node.js](https://nodejs.org/)

- Banco de dados relacional compatível com os scripts SQL do projeto (conforme configurado no `schema.prisma`)

- Navegador web atualizado e extensão **Live Server** no VS Code (opcional/recomendado)



#### Passo A: Configurar o Banco de Dados

1. Abra o seu SGBD local e crie o banco de dados do projeto.

2. Execute o script **`DB-sql/migration_eparking.sql`** para criar as tabelas e a estrutura inicial.

3. *(Opcional)* Execute o script **`DB-sql/e-parking-stress-test.sql`** para popular o banco com dados de teste.



#### Passo B: Configurar e Iniciar o Back-end (API)

1. Acesse a pasta do back-end pelo terminal:

   ```bash

   cd e-parking_backend

   ```

2. Instale as dependências:

   ```bash

   npm install

   ```

3. Configure as variáveis de ambiente criando um arquivo **`.env`** na raiz de `e-parking_backend/` com a variável `DATABASE_URL` apontando para o seu banco de dados (conforme `prisma/schema.prisma` e `src/db.js`).

4. Gere o cliente do Prisma ORM:

   ```bash

   npx prisma generate

   ```

5. Inicie o servidor da API:

   ```bash

   npm start

   ```

   *(Ou execute diretamente: `node src/app.js`)*



#### Passo C: Abrir o Front-end de Proprietários

1. Verifique nos arquivos `e-parking_frontend/owners_landing_page/config.js` e `api.js` se a URL da API corresponde à porta do servidor back-end.

2. Abra o arquivo `e-parking_frontend/owners_landing_page/index.html` no navegador.

3. **Recomendado:** No VS Code, utilize a extensão **Live Server** (botão direito no `index.html` → **Open with Live Server**) ou execute `npx serve .` dentro da pasta `e-parking_frontend/owners_landing_page/` para garantir o funcionamento correto do `fetch()` e dos *Custom Elements* (Navbar e Footer).



---



### 3. Executando Apenas o Front-end / Modo Local (Sprint 2 — Motoristas e Proprietários sem API)



Caso deseje testar apenas a navegação estática ou o fluxo da **Área do Motorista** (que utiliza `localStorage`), não precisa instalar nada:



1. Abra diretamente no navegador o arquivo da área desejada:

   - **Motoristas:** `drivers_landing_page/index.html`

   - **Proprietários:** `owners_landing_page/index.html` (ou `e-parking_frontend/owners_landing_page/index.html`)

2. **Opcional:** No VS Code, use a extensão **Live Server** (botão direito no `index.html` → **Open with Live Server**).



> 💡 **Sobre os dados no `localStorage` (Área do Motorista):** Os dados de usuários e reservas da área do motorista ficam salvos no `localStorage` do navegador. Para começar do zero, abra o DevTools (**F12** → **Application** → **Local Storage**) e apague as chaves `eparking_*`.



---



## 🏢 Área do Proprietário — Sprint 3 (Integração API RESTful)



### Páginas e Funcionalidades Entregues (Proprietários)



| # | Página / Funcionalidade | Caminho | JavaScript? | Funciona na Demo? | Descrição |

| :---: | :--- | :--- | :---: | :---: | :--- |

| 1 | **Index** | `index.html` | Não | Não | Landing page principal de apresentação. |

| 2 | **Sobre Nós** | `pages/about_Us` | Não | Não | Página institucional sobre o projeto. |

| 3 | **Meus Estacionamentos** | `pages/meus_estacionamentos` | Sim | Sim | Listagem dinâmica e exclusão de estacionamentos consumindo a API. |

| 4 | **Edit Estacionamento** | `pages/edit_estacionamento` | Sim | Sim | Edição cadastral de um estacionamento integrada à API. |

| 5 | **Modal de Criação de Estacionamento** | `pages/meus_estacionamentos` | Sim | Sim | Cadastro de novos estacionamentos via modal integrado à API. |

| 6 | **Relatório Financeiro** | `pages/relatorio` | Não | Não | Interface de visualização de relatórios financeiros. |

| 7 | **Login** | `pages/login` | Não | Não | Estrutura visual (autenticação JWT ficou fora do escopo desta sprint). |

| 8 | **Cadastro** | `pages/register` | Não | Não | Estrutura visual de cadastro de proprietário. |



### Endpoints Consumidos no CRUD (`Estacionamentos`)



A comunicação com o back-end utiliza `fetch()` e `async/await` consumindo os seguintes endpoints:



- `GET /estacionamentos/` — Lista todos os estacionamentos.

- `GET /estacionamentos/:id` — Busca os detalhes de um estacionamento específico.

- `GET /estacionamentos/usuario/:id` — Lista os estacionamentos vinculados a um usuário/proprietário.

- `POST /estacionamentos/` — Cadastra um novo estacionamento.

- `PUT /estacionamentos/:id` — Atualiza os dados de um estacionamento existente.

- `DELETE /estacionamentos/:id` — Remove um estacionamento.



---



## 🚘 Área do Motorista — Sprint 2 (JavaScript & `localStorage`)



**Fluxo:** Início (busca) → Resultados → Estacionamento → Pagamento → Confirmação → Minhas reservas, além de Cadastro e Login.



| Página | O que o JavaScript faz |

| :--- | :--- |

| **Início** | Valida destino, data (não aceita data passada) e horário; mostra o usuário logado no cabeçalho. |

| **Cadastro** | Valida nome e sobrenome, CPF (dígitos verificadores, com máscara), e-mail, senha (mín. 6) e confirmação; salva o usuário no `localStorage`. |

| **Login** | Confere e-mail e senha com os usuários salvos e inicia a sessão; volta para a página onde o motorista estava. |

| **Resultados** | Gera os cards dos estacionamentos a partir de um array, com filtros (Coberto, 24 horas, Acessível) e ordenação. |

| **Estacionamento** | Carrega os dados pelo `id` da URL, calcula o total pela duração e valida a reserva. |

| **Pagamento** | Cartão (16 dígitos, validade MM/AA não vencida, CVV), PIX ou pagamento no local; exige login e salva a reserva. |

| **Confirmação** | Mostra a reserva salva com o código gerado. |

| **Minhas reservas** | CRUD local: lista, edita (data, horário e duração, recalculando o valor) e cancela reservas. |



- **CRUD de reservas (`localStorage`):**

  - **Create:** no pagamento

  - **Read:** em Minhas reservas e na confirmação

  - **Update:** no botão Editar

  - **Delete:** no botão Cancelar
