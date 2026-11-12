// selecionando elementos
const tabela = document.getElementById("tabela");
const formulario = document.getElementById("formulario");
const nome = document.getElementById("nome");
const cep = document.getElementById("cep");
const estado = document.getElementById("id_estado");
const municipio = document.getElementById("id_municipio");
const bairro = document.getElementById("bairro");
const logradouro = document.getElementById("logradouro");
const numero = document.getElementById("numero");
const num_alvara = document.getElementById("num_alvara");
const validade_alvara = document.getElementById("validade_alvara");
const hr_abertura = document.getElementById("hr_abertura");
const hr_fechamento = document.getElementById("hr_fechamento");
const qtd_vagas_comum = document.getElementById("qtd_vagas_comum");
const qtd_vagas_pcd = document.getElementById("qtd_vagas_pcd");
const qtd_vagas_idoso = document.getElementById("qtd_vagas_idoso");
const estacionamentoId = document.getElementById("estacionamento_id");

// funções

// apoio

async function carregarEstados() {
  if (!estado) return;

  try {
    const estados = await getEstados();

    estado.innerHTML =
      '<option value="" disabled selected>Selecione um estado...</option>';

    estados.forEach((est) => {
      const option = document.createElement("option");
      option.value = est.id_estado;
      option.textContent = est.nome;
      estado.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar estados:", error);
  }
}

async function carregarMunicipios(id_estado) {
  if (!municipio) return;

  municipio.innerHTML =
    '<option value="" disabled selected>Carregando municípios...</option>';

  try {
    const municipios = await getMunicipiosEstado(id_estado);
    municipio.innerHTML =
      '<option value="" disabled selected>Selecione um município...</option>';

    municipios.forEach((muni) => {
      const option = document.createElement("option");
      option.value = muni.id_municipio || muni.id;
      option.textContent = muni.nome;
      municipio.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar municípios:", error);
    // CORRIGIDO: de selectMunicipio para municipio
    municipio.innerHTML =
      '<option value="" disabled selected>Erro ao carregar municípios</option>';
  }
}

// crud

async function adicionarEstacionamento(e) {
  e.preventDefault();

  const idAtual = estacionamentoId ? estacionamentoId.value : "";

  // montando o objeto Estacionamento
  const dadosEstacionamento = {
    nome: nome.value.trim(),
    id_proprietario: 1, // valor mock ate ser implementado
    cep: cep.value.replace(/\D/g, ""),
    logradouro: logradouro.value.trim(),
    numero: numero.value.trim(),
    bairro: bairro.value.trim(),
    id_municipio: parseInt(municipio.value) || 1,
    latitude: -27.5954, // valor mock ate ser implementado
    longitude: -48.548, // valor mock ate ser implementado
    num_alvara: num_alvara.value.trim(),
    validade_alvara: validade_alvara.value
      ? new Date(validade_alvara.value).toISOString()
      : null,
    hr_abertura: hr_abertura.value,
    hr_fechamento: hr_fechamento.value,
    qtd_vagas_comum: parseInt(qtd_vagas_comum.value) || 0,
    qtd_vagas_pcd: parseInt(qtd_vagas_pcd.value) || 0,
    qtd_vagas_idoso: parseInt(qtd_vagas_idoso.value) || 0,
  };

  try {
    if (idAtual) {
      await putEstacionamento(idAtual, dadosEstacionamento);
    } else {
      await createEstacionamento(dadosEstacionamento);
    }

    window.location.href = "meus_estacionamentos.html";
  } catch (error) {
    console.error("Erro ao salvar estacionamento:", error);
    alert("Erro ao salvar os dados.");
  }
}

async function mostrarEstacionamentos() {
  if (!tabela) return;

  const estacionamentos = await getEstacionamentos(1);

  tabela.replaceChildren();

  estacionamentos.forEach((estacionamento) => {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = estacionamento.id;

    const tdNome = document.createElement("td");
    tdNome.textContent = estacionamento.nome;

    const tdEndereco = document.createElement("td");

    tdEndereco.textContent =
      estacionamento.endereco ||
      `${estacionamento.logradouro}, ${estacionamento.numero}`;

    const tdBotoes = document.createElement("td");

    const buttonStyle =
      "--bs-btn-padding-y: 0.25rem; --bs-btn-padding-x: 0.5rem; --bs-btn-font-size: 0.75rem;";

    // Botão edit
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn btn-edit me-1";
    btnEditar.style.cssText = buttonStyle;
    btnEditar.textContent = "Editar";

    btnEditar.addEventListener("click", () => {
      window.location.href = `editar_estacionamento.html?id=${estacionamento.id}`;
    });

    // Botão Excluir
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn btn-outline-exclude";
    btnExcluir.style.cssText = buttonStyle;
    btnExcluir.textContent = "Excluir";

    btnExcluir.addEventListener("click", () =>
      removerEstacionamento(estacionamento.id),
    );

    tdBotoes.appendChild(btnEditar);
    tdBotoes.appendChild(btnExcluir);

    tr.appendChild(th);
    tr.appendChild(tdNome);
    tr.appendChild(tdEndereco);
    tr.appendChild(tdBotoes);

    tabela.appendChild(tr);
  });
}

async function removerEstacionamento(id) {
  const confirmar = confirm("Deseja realmente excluir este estacionamento?");
  if (!confirmar) return;
  try {
    await deleteEstacionamento(id);
    mostrarEstacionamentos();
  } catch (error) {
    console.error("Erro ao excluir estacionamento:", error);
    alert("Não foi possível excluir o estacionamento.");
  }
}

// eventos

document.addEventListener("DOMContentLoaded", () => {
  mostrarEstacionamentos();
  carregarEstados();

  if (estado) {
    estado.addEventListener("change", (e) => {
      const idEstado = e.target.value;
      carregarMunicipios(idEstado);
    });
  }

  if (formulario) {
    formulario.addEventListener("submit", adicionarEstacionamento);
  }
});
