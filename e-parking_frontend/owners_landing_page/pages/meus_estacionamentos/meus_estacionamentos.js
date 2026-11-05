// globais

const CHAVE = "estacionamento";

// selecionando elementos

const formulario = document.getElementById("formulario");
const nome = document.getElementById("nome");
const endereco = document.getElementById("endereco");
const totalVagas = document.getElementById("totalVagas");
const tabela = document.getElementById("tabela");

// funções

function adicionarEstacionamento(e) {
  // previnindo o refresh

  e.preventDefault();

  //   resgata os estacionamentos do local storage

  const estacionamentos = lerEstacionamentos();

  // pegando o proximo id

  const proximoId = estacionamentos.length + 1;

  //   formatando os dados do nome e endereco

  const strNome = nome.value.trim();
  const strEndereco = endereco.value.trim();
  const strTotalVagas = totalVagas.value.trim();

  // checkando validade dos dados

  if (!strNome || !strEndereco || !strTotalVagas) return;

  // cria o objeto novo estacionamento

  const novoEstacionamento = {
    id: proximoId,
    nome: strNome,
    endereco: strEndereco,
    totalVagas: strTotalVagas,
  };

  //   insere o novo estacionamento

  estacionamentos.push(novoEstacionamento);

  //   salva a nova tabela de estacionamentos no localstorage

  salvarEstacionamento(estacionamentos);

  // recarrega os estacionamentos da tela

  mostrarEstacionamentos();

  // limpa os imputs

  nome.value = "";
  endereco.value = "";
  totalVagas.value = "";
}

function lerEstacionamentos() {
  try {
    // resgata a tabela de estacionamentos do localstorage

    const estacionamentos = JSON.parse(localStorage.getItem(CHAVE)) || [];

    return estacionamentos;
  } catch (error) {
    // imprime o erro no console
    console.error(error);
    return [];
  }
}

function salvarEstacionamento(estacionamentos) {
  try {
    // insere uma tabela com os estacionamentos no localstorage

    localStorage.setItem(CHAVE, JSON.stringify(estacionamentos));
  } catch (error) {
    console.error(error);
  }
}

function mostrarEstacionamentos() {
  // resgata os estacionamentos dalvos

  const estacionamentos = lerEstacionamentos();

  //   apaga a tabela da tela

  tabela.replaceChildren();

  //   percorre a tabela de estacionamentos salvos

  estacionamentos.forEach((estacionamento) => {
    // cria o elemento tr

    const tr = document.createElement("tr");

    // criar elementos da tr

    // 2. Cria e configura o th (número 1)
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = estacionamento.id;

    // 3. Cria e configura a primeira célula de texto (Nome: Green Valley)
    const tdNome = document.createElement("td");
    tdNome.textContent = estacionamento.nome;

    // 4. Cria e configura a segunda célula de texto (Endereço)
    const tdEndereco = document.createElement("td");
    tdEndereco.textContent = estacionamento.endereco;

    // 5. Cria a célula que conterá os botões

    const tdBotoes = document.createElement("td");

    // adicionando estilo dos botoes

    const buttonStyle =
      "--bs-btn-padding-y: 0.25rem; --bs-btn-padding-x: 0.5rem; --bs-btn-font-size: 0.75rem;";

    // botão edit

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn btn-edit";
    btnEditar.style.cssText = buttonStyle;
    btnEditar.textContent = "Editar";

    // botão Excluir

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn btn-outline-exclude";
    btnExcluir.style.cssText = buttonStyle;
    btnExcluir.textContent = "Excluir";

    // evento delete

    btnExcluir.addEventListener("click", () =>
      removerEstacionamento(estacionamento.id),
    );

    // apenda os botoes na td de botoes

    tdBotoes.appendChild(btnEditar);
    tdBotoes.appendChild(btnExcluir);

    tr.appendChild(th);
    tr.appendChild(tdNome);
    tr.appendChild(tdEndereco);
    tr.appendChild(tdBotoes);

    // apenda a tr ao elemento tabela

    tabela.appendChild(tr);
  });
}

function removerEstacionamento(id) {
  // regata os estacionamentos filtrando sem o id informado
  const estacionamentos = lerEstacionamentos().filter((u) => u.id !== id);
  salvarEstacionamento(estacionamentos);
  mostrarEstacionamentos()
}

// pré carrega os estacionamentos

mostrarEstacionamentos();

// eventos

formulario.addEventListener("submit", adicionarEstacionamento);
