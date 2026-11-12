// Selecionando elementos do formulário de edição
const formulario = document.getElementById("formulario");
const estacionamentoIdInput = document.getElementById("estacionamento_id");
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

// Funções de apoio

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
    municipio.innerHTML =
      '<option value="" disabled selected>Erro ao carregar municípios</option>';
  }
}

// Buscar os dados do estacionamento pelo ID da URL e preencher os inputs

async function carregarDadosEstacionamento() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("ID não encontrado...");
    window.location.href = "../meus_estacionamentos/meus_estacionamentos.html";
    return;
  }

  if (estacionamentoIdInput) estacionamentoIdInput.value = id;

  try {
    // Carrega os estados primeiro para montar o select
    await carregarEstados();

    // Busca os dados do estacionamento na API
    const estacionamento = await getEstacionamentoPorId(id);

    if (!estacionamento) {
      console.error("Estacionamento não encontrado.");
      return;
    }

    // Preenchendo os campos com os dados retornados
    if (nome) nome.value = estacionamento.nome || "";
    if (cep) cep.value = estacionamento.cep || "";
    if (bairro) bairro.value = estacionamento.bairro || "";
    if (logradouro) logradouro.value = estacionamento.logradouro || "";
    if (numero) numero.value = estacionamento.numero || "";
    if (num_alvara) num_alvara.value = estacionamento.num_alvara || "";

    // Formata a data para o input datetime-local (YYYY-MM-DDTHH:mm)
    if (validade_alvara && estacionamento.validade_alvara) {
      validade_alvara.value = estacionamento.validade_alvara.slice(0, 16);
    }

    if (hr_abertura) hr_abertura.value = estacionamento.hr_abertura || "";
    if (hr_fechamento) hr_fechamento.value = estacionamento.hr_fechamento || "";
    if (qtd_vagas_comum)
      qtd_vagas_comum.value = estacionamento.qtd_vagas_comum || "";
    if (qtd_vagas_pcd) qtd_vagas_pcd.value = estacionamento.qtd_vagas_pcd || "";
    if (qtd_vagas_idoso)
      qtd_vagas_idoso.value = estacionamento.qtd_vagas_idoso || "";

    // Se houver estado, seleciona e carrega os municípios correspondentes antes de marcar o município
    if (estacionamento.id_estado && estado) {
      estado.value = estacionamento.id_estado;
      await carregarMunicipios(estacionamento.id_estado);
      if (municipio) municipio.value = estacionamento.id_municipio || "";
    } else if (estacionamento.id_municipio && municipio) {
      municipio.value = estacionamento.id_municipio;
    }
  } catch (error) {
    console.error("Erro ao carregar dados para edição:", error);
    alert("Não foi possível carregar as informações do estacionamento.");
  }
}

// Atualizar o estacionamento

async function atualizarEstacionamento(e) {
  e.preventDefault();

  const id = estacionamentoIdInput ? estacionamentoIdInput.value : "";
  if (!id) return;

  const dadosAtualizados = {
    nome: nome.value.trim(),
    id_proprietario: 1, // Valor mock
    cep: cep.value.replace(/\D/g, ""),
    logradouro: logradouro.value.trim(),
    numero: numero.value.trim(),
    bairro: bairro.value.trim(),
    id_municipio: parseInt(municipio.value) || 1,
    latitude: -27.5954, // Valor mock
    longitude: -48.548, // Valor mock
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
    await putEstacionamento(id, dadosAtualizados);
    alert("Estacionamento atualizado com sucesso!");

    // Redireciona para meus estacionamentos
    window.location.href = "../meus_estacionamentos/meus_estacionamentos.html";

  } catch (error) {
    console.error("Erro ao atualizar estacionamento:", error);
    alert("Ocorreu um erro ao salvar as alterações.");
  }
}

// Inicialização das funcoes e dados da pagina ao terminar de carregar

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosEstacionamento();

  if (estado) {
    estado.addEventListener("change", (e) => {
      carregarMunicipios(e.target.value);
    });
  }

  if (formulario) {
    formulario.addEventListener("submit", atualizarEstacionamento);
  }
});
